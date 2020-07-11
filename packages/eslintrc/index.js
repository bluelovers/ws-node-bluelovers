"use strict";
/**
 * Created by user on 2019/5/18.
 */
const EslintrcJson = require("./.eslintrc.json");
const util_1 = require("./lib/util");
const eslintrcJson = {
    ...EslintrcJson,
};
util_1.addTsconfig(eslintrcJson, {
    overwrite: true,
});
module.exports = eslintrcJson;
//# sourceMappingURL=index.js.map