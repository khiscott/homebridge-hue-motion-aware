import { API, Characteristic, Formats, Perms, WithUUID } from "homebridge";

/**
 * Custom "Enabled" characteristic for MotionAware zone on/off control.
 * Uses a private UUID (not in the Eve E863F1xx namespace or HAP spec)
 * so Apple Home / Siri won't treat it as a standard power toggle.
 */
export let HueEnabled: WithUUID<new () => Characteristic>;

export function registerCustomCharacteristics(api: API) {
  HueEnabled = class extends api.hap.Characteristic {
    static readonly UUID = "B984A1F2-FA90-4AC0-A0B8-1CFFCCBF8789";

    constructor() {
      super("Enabled", HueEnabled.UUID, {
        format: Formats.BOOL,
        perms: [Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY],
      });
      this.value = true;
    }
  };
}

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
export function resolveEnabledCharacteristic(
  api: API,
  useStandardActive: boolean,
): WithUUID<new () => Characteristic> {
  return useStandardActive ? api.hap.Characteristic.On : HueEnabled;
}
