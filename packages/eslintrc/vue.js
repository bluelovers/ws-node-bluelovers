"use strict";
/**
 * Created by user on 2019/6/14.
 */
const EslintrcJson = require("./vue/.eslintrc.json");
const util_1 = require("./lib/util");
const eslintrcJson = {
    ...EslintrcJson,
};
(0, util_1.addTsconfig)(eslintrcJson, {
    overwrite: true,
});
module.exports = eslintrcJson;
//# sourceMappingURL=vue.js.map