import { API, Characteristic, WithUUID } from "homebridge";
/**
 * Custom "Enabled" characteristic for MotionAware zone on/off control.
 * Uses a private UUID (not in the Eve E863F1xx namespace or HAP spec)
 * so Apple Home / Siri won't treat it as a standard power toggle.
 */
export declare let HueEnabled: WithUUID<new () => Characteristic>;
export declare function registerCustomCharacteristics(api: API): void;
