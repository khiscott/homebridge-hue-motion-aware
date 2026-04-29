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
