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
declare const noIrregularWhitespace: {
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
    readonly defaultOptions: readonly ["error", IOptions];
    readonly create: (context: TSESLint.RuleContext<string, [IOptions]>) => {
        "Program:exit": () => void;
        Program(node: TSESTree.Program): void;
        Identifier(node: TSESTree.Literal): void;
        Literal(node: TSESTree.Literal): void;
        TemplateElement(node: TSESTree.TemplateElement): void;
    };
};
export default noIrregularWhitespace;
