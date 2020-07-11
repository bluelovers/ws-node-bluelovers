"use strict";
/**
 * Created by user on 2019/6/1.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const rule_1 = __importDefault(require("./rule"));
const cloneDeep = require("lodash.clonedeep");
const _config = {
    plugins: ["@bluelovers"],
    rules: {
        // @ts-ignore
        "no-irregular-whitespace": [
            "off",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
            },
        ],
        "@bluelovers/no-irregular-whitespace": [
            "error",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
            },
        ]
    },
};
const recommended = cloneDeep(_config);
recommended.rules['@bluelovers/no-irregular-whitespace'] = [
    "error",
    {
        "skipComments": true,
        "skipStrings": false,
        "skipTemplates": false,
        "skipRegExps": false,
        "ignores": ['\u3000'],
    },
];
module.exports = {
    rules: rule_1.default,
    configs: {
        all: cloneDeep(_config),
        base: cloneDeep(_config),
        recommended,
        disable: {
            rules: {
                "@bluelovers/no-irregular-whitespace": "off",
            }
        }
    },
};
//# sourceMappingURL=index.js.map