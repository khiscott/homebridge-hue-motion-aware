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
    constructor(platform: HueMotionAwarePlatform, accessory: PlatformAccessory, area: any, motionAreaConfig: any);
    private getEnabled;
    private setEnabled;
    updateEnabled(value: boolean): void;
}
