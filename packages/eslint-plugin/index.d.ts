/**
 * Created by user on 2019/6/1.
 */
import { IOptions } from './rule/no-irregular-whitespace';
declare const _default: {
    rules: {
        readonly "no-template-literals": {
            readonly name: "no-irregular-whitespace";
            meta: {
                readonly type: "problem";
                docs: {
                    readonly description: "disallow irregular whitespace";
                    readonly category: "Possible Errors";
                    readonly recommended: true;
                    readonly url: "https://eslint.org/docs/rules/no-irregular-whitespace";
                };
                schema: readonly [{
                    readonly type: "object";
                    properties: {
                        skipComments: {
                            readonly type: "boolean";
                            readonly default: false;
                        };
                        skipStrings: {
                            readonly type: "boolean";
                            readonly default: true;
                        };
                        skipTemplates: {
                            readonly type: "boolean";
                            readonly default: false;
                        };
                        skipRegExps: {
                            readonly type: "boolean";
                            readonly default: false;
                        };
                        ignores: {
                            readonly type: "array";
                            items: {
                                readonly type: "string";
                            };
                        };
                    };
                    readonly additionalProperties: false;
                }];
            };
            readonly defaultOptions: readonly ["error", IOptions];
            readonly create: (context: import("@typescript-eslint/experimental-utils/dist/ts-eslint/Rule").RuleContext<string, [IOptions]>) => {
                "Program:exit"?: () => void;
                Program?(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Program): void;
                Identifier?(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Literal): void;
                Literal?(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Literal): void;
                TemplateElement?(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").TemplateElement): void;
            };
        };
    };
    configs: {
        all: {
            plugins: string[];
            rules: {
                "no-irregular-whitespace": (string | IOptions)[];
                "@bluelovers/no-irregular-whitespace": (string | IOptions)[];
            };
        };
        base: {
            plugins: string[];
            rules: {
                "no-irregular-whitespace": (string | IOptions)[];
                "@bluelovers/no-irregular-whitespace": (string | IOptions)[];
            };
        };
        recommended: {
            plugins: string[];
            rules: {
                "no-irregular-whitespace": (string | IOptions)[];
                "@bluelovers/no-irregular-whitespace": (string | IOptions)[];
            };
        };
    };
};
export = _default;
