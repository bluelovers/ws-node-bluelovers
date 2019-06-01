/**
 * @fileoverview Rule to disalow whitespace that is not a tab or space, whitespace inside strings and comments are allowed
 * @author Jonathan Kingston
 * @author Christophe Porteneuve
 */
import { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils';
export interface IOptions {
    skipComments?: boolean;
    skipStrings?: boolean;
    skipRegExps?: boolean;
    skipTemplates?: boolean;
    ignores?: string[];
}
export declare type IOptionsArray = [IOptions];
declare const _default: {
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
    readonly defaultOptions: IOptions;
    readonly create: (context: TSESLint.RuleContext<string, [IOptions]>) => {
        "Program:exit"?: () => void;
        Program?(node: TSESTree.Program): void;
        Identifier?(node: TSESTree.Literal): void;
        Literal?(node: TSESTree.Literal): void;
        TemplateElement?(node: TSESTree.TemplateElement): void;
    };
};
export default _default;
