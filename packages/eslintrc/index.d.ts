/**
 * Created by user on 2019/5/18.
 */
declare const eslintrcJson: {
    "parser": string;
    "extends": string[];
    "env": {
        "browser": boolean;
        "node": boolean;
    };
    "parserOptions": {
        "project": string;
    };
    "rules": {
        "eol-last": string[];
        "no-compare-neg-zero": string;
        "no-dupe-args": string;
        "no-dupe-keys": string;
        "no-duplicate-case": string;
        "no-empty-character-class": string;
        "no-ex-assign": string;
        "no-extra-semi": string;
        "no-extra-bind": string;
        "no-extra-label": string;
        "no-extend-native": string;
        "no-irregular-whitespace": (string | {
            "skipComments": boolean;
        })[];
        "camelcase": string;
        "semi": string;
        "@typescript-eslint/semi": string[];
        "no-unexpected-multiline": string;
        "@typescript-eslint/camelcase": string;
        "no-floating-decimal": string;
        "@typescript-eslint/unbound-method": string;
        "@typescript-eslint/indent": string[];
        "@typescript-eslint/restrict-plus-operands": string;
        "@typescript-eslint/member-naming": string;
        "@typescript-eslint/require-array-sort-compare": string;
        "@typescript-eslint/member-ordering": string;
        "@typescript-eslint/prefer-includes": string;
        "@typescript-eslint/no-useless-constructor": string;
        "@typescript-eslint/member-delimiter-style": (string | {
            "multiline": {
                "delimiter": string;
                "requireLast": boolean;
            };
            "singleline": {
                "delimiter": string;
                "requireLast": boolean;
            };
        })[];
        "@typescript-eslint/explicit-function-return-type": (string | {
            "allowExpressions": boolean;
        })[];
        "@typescript-eslint/interface-name-prefix": string[];
        "@typescript-eslint/promise-function-async": (string | {
            "allowedPromiseNames": string[];
        })[];
        "no-case-declarations": string;
        "no-sequences": string;
        "no-unmodified-loop-condition": string;
        "eqeqeq": string[];
        "no-div-regex": string;
        "no-multi-spaces": string;
        "no-else-return": string;
        "no-return-assign": string;
        "no-return-await": string;
        "no-useless-call": string;
        "no-useless-return": string;
        "no-with": string;
        "prefer-promise-reject-errors": string;
        "no-invalid-this": string;
        "require-await": string;
        "vars-on-top": string;
        "radix": string[];
        "wrap-iife": (string | {
            "functionPrototypeMethods": boolean;
        })[];
        "@typescript-eslint/no-use-before-define": (string | {
            "functions": boolean;
            "classes": boolean;
            "variables": boolean;
            "typedefs": boolean;
        })[];
    };
};
export = eslintrcJson;
