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
 *   characteristic above. Invisible to Apple Home / Siri, but still
 *   readable/writable via HomeKit automations and the Homebridge REST API.
 * - `useStandardActive: true`: the standard HAP `Active` characteristic
 *   (UUID 000000B0-..., UINT8 values 0/1). Visible in Apple Home and mappable
 *   as an entity in Home Assistant via the HomeKit Controller integration.
 *
 * Callers must convert their internal boolean state to the matching value type
 * (boolean for the custom characteristic, 0/1 for `Active`).
 */
export function resolveEnabledCharacteristic(
  api: API,
  useStandardActive: boolean,
): WithUUID<new () => Characteristic> {
  return useStandardActive ? api.hap.Characteristic.Active : HueEnabled;
}
