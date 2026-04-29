"use strict";
const platform_1 = require("./platform");
const custom_characteristics_1 = require("./custom-characteristics");
module.exports = (api) => {
    (0, custom_characteristics_1.registerCustomCharacteristics)(api);
    api.registerPlatform("HueMotionAware", platform_1.HueMotionAwarePlatform);
};
//# sourceMappingURL=index.js.map