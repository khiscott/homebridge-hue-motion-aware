"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueEnabled = void 0;
exports.registerCustomCharacteristics = registerCustomCharacteristics;
exports.resolveEnabledCharacteristic = resolveEnabledCharacteristic;
function registerCustomCharacteristics(api) {
    exports.HueEnabled = class extends api.hap.Characteristic {
        static UUID = "B984A1F2-FA90-4AC0-A0B8-1CFFCCBF8789";
        constructor() {
            super("Enabled", exports.HueEnabled.UUID, {
                format: "bool" /* Formats.BOOL */,
                perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "ev" /* Perms.NOTIFY */],
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
function resolveEnabledCharacteristic(api, useStandardActive) {
    return useStandardActive ? api.hap.Characteristic.Active : exports.HueEnabled;
}
//# sourceMappingURL=custom-characteristics.js.map