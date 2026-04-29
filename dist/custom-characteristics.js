"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueEnabled = void 0;
exports.registerCustomCharacteristics = registerCustomCharacteristics;
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
//# sourceMappingURL=custom-characteristics.js.map