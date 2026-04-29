"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
class HueAuth {
    storagePath;
    httpsAgent = new https.Agent({ rejectUnauthorized: false });
    constructor(customStoragePath) {
        // Determine the storage path. 
        // Plugins pass api.user.storagePath().
        // Standalone scripts can pass a path or default to ~/.homebridge or home dir.
        if (customStoragePath) {
            // Ensure we treat it as a directory if it doesn't end in .json
            this.storagePath = customStoragePath.endsWith('.json')
                ? customStoragePath
                : path.join(customStoragePath, 'hue-motion-aware-auth.json');
        }
        else {
            // Fallback for standalone scripts: Check standard Homebridge location first, then home dir
            const hbPath = path.join(os.homedir(), '.homebridge');
            if (fs.existsSync(hbPath)) {
                this.storagePath = path.join(hbPath, 'hue-motion-aware-auth.json');
            }
            else {
                this.storagePath = path.join(os.homedir(), '.hue-motion-aware-auth.json');
            }
        }
    }
    /**
     * Resolves the API key by checking local storage or initiating a pairing process.
     */
    async resolveApiKey(bridgeIp, logger) {
        const storedKey = this.loadKey();
        if (storedKey) {
            logger.debug(`Loaded existing API key from ${this.storagePath}`);
            return storedKey;
        }
        return await this.startPairing(bridgeIp, logger);
    }
    loadKey() {
        if (fs.existsSync(this.storagePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
                return data.apiKey;
            }
            catch (e) {
                // Corrupted file, ignore
            }
        }
        return undefined;
    }
    saveKey(apiKey) {
        try {
            const dir = path.dirname(this.storagePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.storagePath, JSON.stringify({ apiKey }, null, 2));
        }
        catch (e) {
            console.error(`Failed to save API key to ${this.storagePath}: ${e.message}`);
        }
    }
    async startPairing(bridgeIp, logger) {
        logger.warn('*************************************************************');
        logger.warn('  NO HUE API KEY FOUND. STARTING AUTOMATIC PAIRING.');
        logger.warn('  PLEASE PRESS THE LINK BUTTON ON YOUR HUE BRIDGE NOW!');
        logger.warn(`  Storage location: ${this.storagePath}`);
        logger.warn('*************************************************************');
        const maxAttempts = 30; // 60 seconds
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios_1.default.post(`https://${bridgeIp}/api`, { devicetype: 'homebridge#hue-motion-aware' }, { httpsAgent: this.httpsAgent, timeout: 5000 });
                if (response.data[0]?.success?.username) {
                    const key = response.data[0].success.username;
                    logger.info('SUCCESSFULLY PAIRED! API Key obtained.');
                    this.saveKey(key);
                    return key;
                }
            }
            catch (e) {
                logger.debug(`Pairing attempt ${i + 1} failed: ${e.message}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        logger.error('PAIRING TIMEOUT. Please try again.');
        return undefined;
    }
}
exports.HueAuth = HueAuth;
//# sourceMappingURL=hue-auth.js.map