import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge";
export declare class HueMotionAwarePlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly accessories: PlatformAccessory[];
    private serviceToAccessoryMap;
    private configToAccessoryMap;
    private readonly hueAuth;
    private apiKey?;
    private bridgeIp?;
    constructor(log: Logger, config: PlatformConfig, api: API);
    configureAccessory(accessory: PlatformAccessory): void;
    discoverDevices(): Promise<void>;
    private startEventStream;
    private updateAccessoryPresence;
    setZoneEnabled(configId: string, enabled: boolean): Promise<void>;
}
