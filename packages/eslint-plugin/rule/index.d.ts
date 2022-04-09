/**
 * Created by user on 2019/6/1.
 */
declare const rules: {
    readonly "@bluelovers/no-irregular-whitespace": {
        readonly name: "no-irregular-whitespace";
        readonly meta: {
            readonly type: "problem";
            readonly docs: {
                readonly description: "disallow irregular whitespace";
                readonly category: "Possible Errors";
                readonly recommended: true;
                readonly url: "https://eslint.org/docs/rules/no-irregular-whitespace";
            };
            readonly messages: {
                readonly noIrregularWhitespace: "Irregular whitespace not allowed.";
            };
            readonly schema: readonly [{
                readonly type: "object";
                readonly properties: {
                    readonly skipComments: {
                        readonly type: "boolean";
                        readonly default: false;
                    };
                    readonly skipStrings: {
                        readonly type: "boolean";
                        readonly default: true;
                    };
                    readonly skipTemplates: {
                        readonly type: "boolean";
                        readonly default: false;
                    };
                    readonly skipRegExps: {
                        readonly type: "boolean";
                        readonly default: false;
                    };
                    readonly ignores: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
                readonly additionalProperties: false;
            }];
        };
        readonly defaultOptions: readonly ["error", import("./no-irregular-whitespace").IOptions];
        readonly create: (context: RuleContext<string, import("./no-irregular-whitespace").IOptionsArray>) => {
            "Program:exit": () => void;
            Program(node: import("@typescript-eslint/types/dist/generated/ast-spec").Program): void;
            Identifier(node: import("@typescript-eslint/types/dist/generated/ast-spec").Literal): void;
            Literal(node: import("@typescript-eslint/types/dist/generated/ast-spec").Literal): void;
            TemplateElement(node: import("@typescript-eslint/types/dist/generated/ast-spec").TemplateElement): void;
        };
    };
};
export default rules;
