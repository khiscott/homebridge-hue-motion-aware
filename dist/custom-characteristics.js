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
 *   characteristic above, hosted on the MotionSensor service. Invisible to
 *   Apple Home / Siri, but still readable/writable via HomeKit automations and
 *   the Homebridge REST API.
 * - `useStandardActive: true`: the standard HAP `On` characteristic, hosted on
 *   a dedicated Switch service (see HueMotionSensorAccessory). `Active` on a
 *   MotionSensor is non-conformant and Home Assistant's HomeKit Controller
 *   ignores it, whereas a Switch + `On` maps to a controllable entity in both
 *   Apple Home and Home Assistant. `On` is a native boolean.
 */
function resolveEnabledCharacteristic(api, useStandardActive) {
    return useStandardActive ? api.hap.Characteristic.On : exports.HueEnabled;
}
//# sourceMappingURL=custom-characteristics.js.map