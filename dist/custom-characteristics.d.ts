import { API, Characteristic, WithUUID } from "homebridge";
/**
 * Custom "Enabled" characteristic for MotionAware zone on/off control.
 * Uses a private UUID (not in the Eve E863F1xx namespace or HAP spec)
 * so Apple Home / Siri won't treat it as a standard power toggle.
 */
export declare let HueEnabled: WithUUID<new () => Characteristic>;
export declare function registerCustomCharacteristics(api: API): void;
/**
 * Resolves which HAP characteristic backs the zone enabled/disabled toggle.
 *
 * - `useStandardActive: false` (default): the private custom "Enabled" BOOL
 *   characteristic above, hosted on the MotionSensor service. Invisible to
 *   Apple Home / Siri, but still readable/writable via HomeKit automations and
 *   the Homebridge REST API.
 * - `useStandardActive: true`: the standard HAP `On` characteristic, hosted on
 *   a dedicated Switch service (see HueMotionSensorAccessory). `Active` on a
 *   MotionSensor is non-conformant and Home Assistant's HomeKit Controller
 *   ignores it, whereas a Switch + `On` maps to a controllable entity in both
 *   Apple Home and Home Assistant. `On` is a native boolean.
 */
export declare function resolveEnabledCharacteristic(api: API, useStandardActive: boolean): WithUUID<new () => Characteristic>;
