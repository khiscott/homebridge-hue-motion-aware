"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueMotionSensorAccessory = void 0;
const custom_characteristics_1 = require("./custom-characteristics");
class HueMotionSensorAccessory {
    platform;
    accessory;
    area;
    motionAreaConfig;
    service;
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
        // If the user switched modes, drop the toggle characteristic from the
        // other mode so a single accessory doesn't end up with two toggles.
        const staleCharacteristic = this.useStandardActive
            ? custom_characteristics_1.HueEnabled
            : this.platform.Characteristic.Active;
        if (this.hasCharacteristic(staleCharacteristic)) {
            this.service.removeCharacteristic(this.service.getCharacteristic(staleCharacteristic));
        }
        // Add the enabled toggle characteristic (custom "Enabled" or standard "Active")
        if (!this.hasCharacteristic(this.enabledCharacteristic)) {
            this.service.addCharacteristic(this.enabledCharacteristic);
        }
        this.service.getCharacteristic(this.enabledCharacteristic)
            .onGet(this.getEnabled.bind(this))
            .onSet(this.setEnabled.bind(this));
        this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(this.enabled));
    }
    /**
     * Existence check by UUID. `testCharacteristic` requires the stricter
     * `WithUUID<typeof Characteristic>` type, which the custom characteristic
     * doesn't satisfy, so we match against the service's characteristics directly.
     */
    hasCharacteristic(characteristic) {
        return this.service.characteristics.some((existing) => existing.UUID === characteristic.UUID);
    }
    /**
     * Maps the internal boolean state to the value type expected by the active
     * characteristic: a boolean for the custom "Enabled" characteristic, or the
     * 0/1 integer constants for the standard HAP "Active" characteristic.
     */
    toCharacteristicValue(enabled) {
        if (this.useStandardActive) {
            return enabled
                ? this.platform.Characteristic.Active.ACTIVE
                : this.platform.Characteristic.Active.INACTIVE;
        }
        return enabled;
    }
    getEnabled() {
        return this.toCharacteristicValue(this.enabled);
    }
    async setEnabled(value) {
        const newValue = this.useStandardActive
            ? value === this.platform.Characteristic.Active.ACTIVE
            : value;
        this.platform.log.info(`Setting zone ${this.configId} enabled: ${newValue}`);
        try {
            await this.platform.setZoneEnabled(this.configId, newValue);
            this.enabled = newValue;
        }
        catch (error) {
            this.platform.log.error(`Failed to set zone ${this.configId} enabled: ${error.message}`);
            // Revert the HomeKit characteristic to actual state
            this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(this.enabled));
            throw error; // Tell HomeKit the write failed
        }
    }
    updateEnabled(value) {
        this.enabled = value;
        this.service.updateCharacteristic(this.enabledCharacteristic, this.toCharacteristicValue(value));
    }
}
exports.HueMotionSensorAccessory = HueMotionSensorAccessory;
//# sourceMappingURL=accessory.js.map