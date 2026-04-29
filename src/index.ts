import { API } from "homebridge";
import { HueMotionAwarePlatform } from "./platform";
import { registerCustomCharacteristics } from "./custom-characteristics";

/**
 * Register the platform with Homebridge
 */
export = (api: API) => {
  registerCustomCharacteristics(api);
  api.registerPlatform("HueMotionAware", HueMotionAwarePlatform);
};
