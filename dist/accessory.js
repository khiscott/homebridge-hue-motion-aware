"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueMotionSensorAccessory = void 0;
const custom_characteristics_1 = require("./custom-characteristics");
/** Subtype for the dedicated Switch service hosting the enabled toggle
 *  (`useStandardActive: true` mode), so it's distinguishable from the
 *  MotionSensor service and any other Switch. */
const TOGGLE_SUBTYPE = "zone-enabled";
class HueMotionSensorAccessory {
    platform;
    accessory;
    area;
    motionAreaConfig;
    service;
    /** Service hosting the enabled toggle: the MotionSensor service itself
     *  (custom characteristic mode) or a dedicated Switch service. */
    toggleService;
    enabled;
    configId;
    useStandardActive;
    enabledCharacteristic;
    constructor(platform, accessory, area, motionAreaConfig) {
        this.platform = platform;
        this.accessory = accessory;
        this.area = area;
        this.motionAreaConfig = motionAreaConfig;
        this.configId = motionAreaConfig.id;
        this.enabled = motionAreaConfig.enabled ?? true;
        this.useStandardActive = platform.config.useStandardActive === true;
        this.enabledCharacteristic = (0, custom_characteristics_1.resolveEnabledCharacteristic)(this.platform.api, this.useStandardActive);
        // Set accessory information
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
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
        // `Active` on the MotionSensor service is no longer used in any mode
        // (v1.2.0 placed it there; non-conformant per HAP spec, and Home
        // Assistant silently ignores it) — drop it from cached accessories.
        this.removeCharacteristicIfPresent(this.service, this.platform.Characteristic.Active);
        if (this.useStandardActive) {
            // Standard mode: host the toggle as `On` on a dedicated Switch service,
            // which both Apple Home and Home Assistant map to a controllable entity.
            // Drop the custom characteristic if this accessory previously ran in
            // default mode. The Switch service includes `On` by default.
            this.removeCharacteristicIfPresent(this.service, custom_characteristics_1.HueEnabled);
            this.toggleService =
                this.accessory.getServiceById(this.platform.Service.Switch, TOGGLE_SUBTYPE) ||
                    this.accessory.addService(this.platform.Service.Switch, `${accessory.displayName} Enabled`, TOGGLE_SUBTYPE);
        }
        else {
            // Default mode (unchanged): custom characteristic on the MotionSensor
            // service. If the user switched back from standard mode, the toggle was
            // a whole extra service there — remove it, not just a characteristic.
            const staleSwitch = this.accessory.getServiceById(this.platform.Service.Switch, TOGGLE_SUBTYPE);
            if (staleSwitch) {
                this.accessory.removeService(staleSwitch);
            }
            this.toggleService = this.service;
            if (!this.hasCharacteristic(this.toggleService, this.enabledCharacteristic)) {
                this.toggleService.addCharacteristic(this.enabledCharacteristic);
            }
        }
        this.toggleService.getCharacteristic(this.enabledCharacteristic)
            .onGet(this.getEnabled.bind(this))
            .onSet(this.setEnabled.bind(this));
        this.toggleService.updateCharacteristic(this.enabledCharacteristic, this.enabled);
    }
    /**
     * Existence check by UUID. `testCharacteristic` requires the stricter
     * `WithUUID<typeof Characteristic>` type, which the custom characteristic
     * doesn't satisfy, so we match against the service's characteristics directly.
     */
    hasCharacteristic(service, characteristic) {
        return service.characteristics.some((existing) => existing.UUID === characteristic.UUID);
    }
    removeCharacteristicIfPresent(service, characteristic) {
        const existing = service.characteristics.find((c) => c.UUID === characteristic.UUID);
        if (existing) {
            service.removeCharacteristic(existing);
        }
    }
    getEnabled() {
        return this.enabled;
    }
    async setEnabled(value) {
        const newValue = value;
        this.platform.log.info(`Setting zone ${this.configId} enabled: ${newValue}`);
        try {
            await this.platform.setZoneEnabled(this.configId, newValue);
            this.enabled = newValue;
        }
        catch (error) {
            this.platform.log.error(`Failed to set zone ${this.configId} enabled: ${error.message}`);
            // Revert the HomeKit characteristic to actual state
            this.toggleService.updateCharacteristic(this.enabledCharacteristic, this.enabled);
            throw error; // Tell HomeKit the write failed
        }
    }
    updateEnabled(value) {
        this.enabled = value;
        this.toggleService.updateCharacteristic(this.enabledCharacteristic, value);
    }
}
exports.HueMotionSensorAccessory = HueMotionSensorAccessory;
//# sourceMappingURL=accessory.js.map