import {
  Service,
  PlatformAccessory,
  CharacteristicValue,
  Characteristic,
  WithUUID,
} from "homebridge";
import { HueMotionAwarePlatform } from "./platform";
import { HueEnabled, resolveEnabledCharacteristic } from "./custom-characteristics";

export class HueMotionSensorAccessory {
  private service: Service;
  private enabled: boolean;
  private readonly configId: string;
  private readonly useStandardActive: boolean;
  private readonly enabledCharacteristic: WithUUID<new () => Characteristic>;

  constructor(
    private readonly platform: HueMotionAwarePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly area: any,
    private readonly motionAreaConfig: any,
  ) {
    this.configId = motionAreaConfig.id;
    this.enabled = motionAreaConfig.enabled ?? true;
    this.useStandardActive = platform.config.useStandardActive === true;
    this.enabledCharacteristic = resolveEnabledCharacteristic(
      this.platform.api,
      this.useStandardActive,
    );

    // Set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Philips")
      .setCharacteristic(this.platform.Characteristic.Model, "Hue MotionAware Zone")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, area.id);

    // Get the MotionSensor service if it exists, otherwise create a new MotionSensor service
    this.service =
      this.accessory.getService(this.platform.Service.MotionSensor) ||
      this.accessory.addService(this.platform.Service.MotionSensor);

    // Set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);

    // Initialize motion state
    const isPresent = area.motion?.motion === true;
    this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, isPresent);

    // If the user switched modes, drop the toggle characteristic from the
    // other mode so a single accessory doesn't end up with two toggles.
    const staleCharacteristic = this.useStandardActive
      ? HueEnabled
      : this.platform.Characteristic.Active;
    if (this.hasCharacteristic(staleCharacteristic)) {
      this.service.removeCharacteristic(this.service.getCharacteristic(staleCharacteristic)!);
    }

    // Add the enabled toggle characteristic (custom "Enabled" or standard "Active")
    if (!this.hasCharacteristic(this.enabledCharacteristic)) {
      this.service.addCharacteristic(this.enabledCharacteristic);
    }

    this.service.getCharacteristic(this.enabledCharacteristic)!
      .onGet(this.getEnabled.bind(this))
      .onSet(this.setEnabled.bind(this));

    this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(this.enabled));
  }

  /**
   * Existence check by UUID. `testCharacteristic` requires the stricter
   * `WithUUID<typeof Characteristic>` type, which the custom characteristic
   * doesn't satisfy, so we match against the service's characteristics directly.
   */
  private hasCharacteristic(characteristic: WithUUID<new () => Characteristic>): boolean {
    return this.service.characteristics.some((existing) => existing.UUID === characteristic.UUID);
  }

  /**
   * Maps the internal boolean state to the value type expected by the active
   * characteristic: a boolean for the custom "Enabled" characteristic, or the
   * 0/1 integer constants for the standard HAP "Active" characteristic.
   */
  private toCharacteristicValue(enabled: boolean): CharacteristicValue {
    if (this.useStandardActive) {
      return enabled
        ? this.platform.Characteristic.Active.ACTIVE
        : this.platform.Characteristic.Active.INACTIVE;
    }
    return enabled;
  }

  private getEnabled(): CharacteristicValue {
    return this.toCharacteristicValue(this.enabled);
  }

  private async setEnabled(value: CharacteristicValue): Promise<void> {
    const newValue = this.useStandardActive
      ? value === this.platform.Characteristic.Active.ACTIVE
      : (value as boolean);
    this.platform.log.info(`Setting zone ${this.configId} enabled: ${newValue}`);
    try {
      await this.platform.setZoneEnabled(this.configId, newValue);
      this.enabled = newValue;
    } catch (error: any) {
      this.platform.log.error(`Failed to set zone ${this.configId} enabled: ${error.message}`);
      // Revert the HomeKit characteristic to actual state
      this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(this.enabled));
      throw error; // Tell HomeKit the write failed
    }
  }

  updateEnabled(value: boolean) {
    this.enabled = value;
    this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(value));
  }
}
