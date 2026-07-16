import { PlatformAccessory } from "homebridge";
import { HueMotionAwarePlatform } from "./platform";
export declare class HueMotionSensorAccessory {
    private readonly platform;
    private readonly accessory;
    private readonly area;
    private readonly motionAreaConfig;
    private service;
    /** Service hosting the enabled toggle: the MotionSensor service itself
     *  (custom characteristic mode) or a dedicated Switch service. */
    private toggleService;
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
    private removeCharacteristicIfPresent;
    private getEnabled;
    private setEnabled;
    updateEnabled(value: boolean): void;
}
