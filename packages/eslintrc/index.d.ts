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
        "getter-return": (string | {
            "allowImplicit": boolean;
        })[];
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
            "skipStrings": boolean;
            "skipTemplates": boolean;
            "skipRegExps": boolean;
        })[];
        "camelcase": string;
        "semi": string;
        "@typescript-eslint/semi": string[];
        "symbol-description": string;
        "require-yield": string;
        "prefer-rest-params": string;
        "object-shorthand": string;
        "no-unexpected-multiline": string;
        "@typescript-eslint/camelcase": string;
        "no-floating-decimal": string;
        "no-var": string;
        "@typescript-eslint/unbound-method": string;
        "no-useless-rename": (string | {
            "ignoreDestructuring": boolean;
        })[];
        "@typescript-eslint/indent": string[];
        "@typescript-eslint/restrict-plus-operands": string;
        "@typescript-eslint/member-naming": (string | {
            "private": string;
        })[];
        "@typescript-eslint/require-array-sort-compare": string;
        "@typescript-eslint/no-angle-bracket-type-assertion": string;
        "@typescript-eslint/class-name-casing": string;
        "@typescript-eslint/no-empty-interface": (string | {
            "allowSingleExtends": boolean;
        })[];
        "@typescript-eslint/member-ordering": string;
        "@typescript-eslint/prefer-includes": string;
        "@typescript-eslint/adjacent-overload-signatures": string;
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
        "no-unused-expressions": (string | {
            "allowShortCircuit": boolean;
            "allowTernary": boolean;
        })[];
        "no-throw-literal": string;
        "no-case-declarations": string;
        "no-sequences": string;
        "no-unmodified-loop-condition": string;
        "eqeqeq": string[];
        "no-div-regex": string;
        "no-multi-spaces": string;
        "no-multi-str": string;
        "no-new": string;
        "no-proto": string;
        "no-redeclare": string;
        "no-octal-escape": string;
        "no-else-return": string;
        "no-return-assign": string[];
        "no-return-await": string;
        "no-self-compare": string;
        "no-catch-shadow": string;
        "no-label-var": string;
        "no-buffer-constructor": string;
        "no-shadow-restricted-names": string;
        "no-useless-call": string;
        "no-useless-return": string;
        "no-unused-vars": string;
        "arrow-parens": string;
        "no-with": string;
        "prefer-promise-reject-errors": (string | {
            "allowEmptyReject": boolean;
        })[];
        "no-invalid-this": string;
        "require-await": string;
        "no-self-assign": (string | {
            "props": boolean;
        })[];
        "vars-on-top": string;
        "no-useless-escape": string;
        "no-shadow": string;
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
        "@typescript-eslint/prefer-regexp-exec": string;
    };
};
export = eslintrcJson;
