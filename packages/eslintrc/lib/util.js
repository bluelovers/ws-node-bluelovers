"use strict";
/**
 * Created by user on 2019/6/14.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTsconfig = void 0;
const find_tsconfig_1 = require("@yarn-tool/find-tsconfig");
function addTsconfig(eslintrcJson, options) {
    let { cwd = process.cwd(), overwrite } = options || {};
    if (overwrite || !eslintrcJson.parserOptions.project) {
        let file = find_tsconfig_1.findTsconfig(cwd);
        if (file) {
            eslintrcJson.parserOptions.project = file;
        }
    }
    return eslintrcJson;
}
exports.addTsconfig = addTsconfig;
//# sourceMappingURL=util.js.map