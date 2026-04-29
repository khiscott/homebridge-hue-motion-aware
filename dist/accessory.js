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
    constructor(platform, accessory, area, motionAreaConfig) {
        this.platform = platform;
        this.accessory = accessory;
        this.area = area;
        this.motionAreaConfig = motionAreaConfig;
        this.configId = motionAreaConfig.id;
        this.enabled = motionAreaConfig.enabled ?? true;
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
        // Add custom Enabled characteristic
        if (!this.service.testCharacteristic("Enabled")) {
            this.service.addCharacteristic(custom_characteristics_1.HueEnabled);
        }
        this.service.getCharacteristic("Enabled")
            .onGet(this.getEnabled.bind(this))
            .onSet(this.setEnabled.bind(this));
        this.service.updateCharacteristic("Enabled", this.enabled);
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
            this.service.updateCharacteristic("Enabled", this.enabled);
            throw error; // Tell HomeKit the write failed
        }
    }
    updateEnabled(value) {
        this.enabled = value;
        this.service.updateCharacteristic("Enabled", value);
    }
}
exports.HueMotionSensorAccessory = HueMotionSensorAccessory;
//# sourceMappingURL=accessory.js.map