import { PlatformAccessory } from "homebridge";
import { HueMotionAwarePlatform } from "./platform";
export declare class HueMotionSensorAccessory {
    private readonly platform;
    private readonly accessory;
    private readonly area;
    private readonly motionAreaConfig;
    private service;
    private enabled;
    private readonly configId;
    private readonly useStandardActive;
    private readonly enabledCharacteristic;
    constructor(platform: HueMotionAwarePlatform, accessory: PlatformAccessory, area: any, motionAreaConfig: any);
    /**
     * Existence check by UUID. `testCharacteristic` requires the stricter
     * `WithUUID<typeof Characteristic>` type, which the custom characteristic
     * doesn't satisfy, so we match against the service's characteristics directly.
     */
    private hasCharacteristic;
    /**
     * Maps the internal boolean state to the value type expected by the active
     * characteristic: a boolean for the custom "Enabled" characteristic, or the
     * 0/1 integer constants for the standard HAP "Active" characteristic.
     */
    private toCharacteristicValue;
    private getEnabled;
    private setEnabled;
    updateEnabled(value: boolean): void;
}
