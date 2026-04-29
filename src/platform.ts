import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";
import axios from "axios";
import EventSource from "eventsource";
import { HueMotionSensorAccessory } from "./accessory";
import { HueAuth } from "./hue-auth";

export class HueMotionAwarePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  public readonly accessories: PlatformAccessory[] = [];
  private serviceToAccessoryMap = new Map<string, string>();
  private configToAccessoryMap = new Map<string, HueMotionSensorAccessory>();
  private readonly hueAuth: HueAuth;
  private apiKey?: string;
  private bridgeIp?: string;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;
    this.hueAuth = new HueAuth(this.api.user.storagePath());

    this.api.on("didFinishLaunching", () => {
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    this.bridgeIp = this.config.bridgeIp;

    if (!this.bridgeIp) {
      this.log.error("Bridge IP missing in config.");
      return;
    }

    // Resolve API Key (load from config, store, or pair)
    if (this.config.apiKey) {
      this.apiKey = this.config.apiKey;
    } else {
      this.apiKey = await this.hueAuth.resolveApiKey(this.bridgeIp, this.log);
    }

    if (!this.apiKey) {
      this.log.error("Could not obtain API Key. Setup aborted.");
      return;
    }

    try {
      const response = await axios.get(`https://${this.bridgeIp}/clip/v2/resource`, {
        headers: { "hue-application-key": this.apiKey },
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      });

      const resources = response.data.data;

      // Filter ONLY for motion services owned by a motion_area_configuration
      const rawMotionServices = resources.filter(
        (r: any) =>
          (r.type === "convenience_area_motion" || r.type === "security_area_motion") &&
          r.owner.rtype === "motion_area_configuration",
      );

      const groups = new Map<string, any[]>();
      for (const service of rawMotionServices) {
        const ownerId = service.owner.rid;
        if (!groups.has(ownerId)) {
          groups.set(ownerId, []);
        }
        groups.get(ownerId)!.push(service);
      }

      const activeUuids = new Set<string>();

      for (const [ownerId, services] of groups) {
        const motionAreaConfig = resources.find(
          (r: any) => r.type === "motion_area_configuration" && r.id === ownerId,
        );

        const name = motionAreaConfig?.name || `Motion Zone ${ownerId}`;
        const uuid = this.api.hap.uuid.generate(ownerId);
        activeUuids.add(uuid);

        for (const s of services) {
          this.serviceToAccessoryMap.set(s.id, uuid);
        }

        const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

        if (existingAccessory) {
          this.log.info("Restoring existing accessory:", name);
          const handler = new HueMotionSensorAccessory(this, existingAccessory, services[0], motionAreaConfig);
          this.configToAccessoryMap.set(ownerId, handler);
        } else {
          this.log.info("Adding new accessory:", name);
          const accessory = new this.api.platformAccessory(name, uuid);
          accessory.context.device = services[0];
          const handler = new HueMotionSensorAccessory(this, accessory, services[0], motionAreaConfig);
          this.configToAccessoryMap.set(ownerId, handler);
          this.api.registerPlatformAccessories("homebridge-hue-motion-aware", "HueMotionAware", [
            accessory,
          ]);
          this.accessories.push(accessory);
        }
      }

      // CLEANUP: Remove accessories from cache that are no longer present on the bridge
      const staleAccessories = this.accessories.filter((acc) => !activeUuids.has(acc.UUID));
      if (staleAccessories.length > 0) {
        this.log.info(`Removing ${staleAccessories.length} stale accessories from Homebridge cache.`);
        this.api.unregisterPlatformAccessories(
          "homebridge-hue-motion-aware",
          "HueMotionAware",
          staleAccessories,
        );
        // Remove from local list
        staleAccessories.forEach((stale) => {
          const index = this.accessories.indexOf(stale);
          if (index > -1) {
            this.accessories.splice(index, 1);
          }
        });
      }

      this.startEventStream(this.bridgeIp, this.apiKey);
    } catch (error: any) {
      this.log.error("Failed to discover devices:", error.message);
    }
  }

  private startEventStream(bridgeIp: string, apiKey: string) {
    this.log.info("Connecting to Hue Event Stream...");

    const es = new EventSource(`https://${bridgeIp}/eventstream/clip/v2`, {
      headers: { "hue-application-key": apiKey },
      https: { rejectUnauthorized: false },
    } as any);

    es.onmessage = (event: any) => {
      try {
        const messages = JSON.parse(event.data);
        for (const message of messages) {
          if (message.type === "update") {
            for (const data of message.data) {
              // Handle motion updates from motion services
              const accessoryUuid = this.serviceToAccessoryMap.get(data.id);
              if (accessoryUuid) {
                const isMotion = data.motion?.motion;
                if (isMotion !== undefined) {
                  this.log.debug(`Motion update for ${data.id}: ${isMotion}`);
                  this.updateAccessoryPresence(accessoryUuid, isMotion);
                }
              }

              // Handle enabled updates from motion_area_configuration
              if (data.type === "motion_area_configuration" && data.enabled !== undefined) {
                const handler = this.configToAccessoryMap.get(data.id);
                if (handler) {
                  this.log.debug(`Enabled update for ${data.id}: ${data.enabled}`);
                  handler.updateEnabled(data.enabled);
                }
              }
            }
          }
        }
      } catch (e) {
        this.log.error("Error parsing event data.");
      }
    };

    es.onerror = (error: any) => {
      this.log.error("EventStream Connection lost. Retrying via Homebridge...");
    };
  }

  private updateAccessoryPresence(uuid: string, isMotion: boolean) {
    const accessory = this.accessories.find((a) => a.UUID === uuid);
    if (accessory) {
      const service = accessory.getService(this.Service.MotionSensor);
      service?.updateCharacteristic(this.Characteristic.MotionDetected, isMotion);
    }
  }

  async setZoneEnabled(configId: string, enabled: boolean): Promise<void> {
    await axios.put(
      `https://${this.bridgeIp}/clip/v2/resource/motion_area_configuration/${configId}`,
      { enabled },
      {
        headers: { "hue-application-key": this.apiKey },
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      },
    );
  }
}
