/**
 * Created by user on 2019/6/1.
 */
declare const rules: {
    readonly "@bluelovers/no-irregular-whitespace": {
        readonly name: "no-irregular-whitespace";
        meta: {
            readonly type: "problem";
            docs: {
                readonly description: "disallow irregular whitespace";
                readonly category: "Possible Errors";
                readonly recommended: true;
                readonly url: "https://eslint.org/docs/rules/no-irregular-whitespace";
            };
            messages: {
                readonly noIrregularWhitespace: "Irregular whitespace not allowed.";
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
        readonly defaultOptions: readonly ["error", import("./no-irregular-whitespace").IOptions];
        readonly create: (context: any) => {
            "Program:exit": () => void;
            Program(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Program): void;
            Identifier(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Literal): void;
            Literal(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").Literal): void;
            TemplateElement(node: import("@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree").TemplateElement): void;
        };
    };
};
export default rules;
