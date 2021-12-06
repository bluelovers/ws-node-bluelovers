"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderTweak = void 0;
const EslintrcJson = require("../.eslintrc.json");
const sortObject = require("sort-object-keys2");
const fs = require("fs");
const path = require("path");
let keys = Object.keys(EslintrcJson.rules)
    .sort()
    .sort(function (a, b) {
    // @ts-ignore
    let i1 = a.startsWith('@') | 0;
    // @ts-ignore
    let i2 = b.startsWith('@') | 0;
    let r = i1 - i2;
    return r;
});
// @ts-ignore
EslintrcJson.rules = sortObject(EslintrcJson.rules, {
    keys: orderTweak(keys, [
        ...keys.reduce((a, b) => {
            if (/^@typescript-eslint\/(.+)$/.test(b)) {
                a.push([RegExp.$1, b]);
            }
            return a;
        }, []),
        /*
        ['semi', '@typescript-eslint/semi'],
        ['no-extra-parens', '@typescript-eslint/no-extra-parens'],
        ['func-call-spacing', '@typescript-eslint/func-call-spacing'],
        ['indent', '@typescript-eslint/indent'],
        ['no-magic-numbers', '@typescript-eslint/no-magic-numbers'],
        ['camelcase', '@typescript-eslint/camelcase'],
        ['no-unused-vars', '@typescript-eslint/no-unused-vars'],
        ['no-use-before-define', '@typescript-eslint/no-use-before-define'],
         */
    ], true),
});
let json = JSON.stringify(EslintrcJson, null, 2);
fs.writeFileSync(path.join(__dirname, '..', '.eslintrc.json'), json);
function orderTweak(keys, groups, mode) {
    let ret = keys.slice();
    mode = !!mode;
    groups.forEach(ls => {
        if (ls.length > 1) {
            ls.reduce((p, k) => {
                let pi = ret.indexOf(p);
                let ki = ret.indexOf(k);
                if (pi !== -1 && ki !== -1) {
                    if (mode && ki > pi) {
                        let ps = ret[pi];
                        ret.splice(ki, 0, ps);
                        ret.splice(pi, 1);
                    }
                    else if (!mode && ki < pi) {
                        let pa = ret.splice(pi, 1);
                        ret.splice(ki, 0, ...pa);
                    }
                }
                return k;
            });
        }
    });
    return ret;
}
exports.orderTweak = orderTweak;
//# sourceMappingURL=sort-eslintrc.js.map