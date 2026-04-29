export interface AuthData {
    apiKey: string;
}
export declare class HueAuth {
    private readonly storagePath;
    private readonly httpsAgent;
    constructor(customStoragePath?: string);
    /**
     * Resolves the API key by checking local storage or initiating a pairing process.
     */
    resolveApiKey(bridgeIp: string, logger: {
        info: (msg: string) => void;
        warn: (msg: string) => void;
        error: (msg: string) => void;
        debug: (msg: string) => void;
    }): Promise<string | undefined>;
    private loadKey;
    private saveKey;
    private startPairing;
}
