/**
 * @fileoverview Rule to disalow whitespace that is not a tab or space, whitespace inside strings and comments are allowed
 * @author Jonathan Kingston
 * @author Christophe Porteneuve
 */

"use strict";

import {
	AST_NODE_TYPES,
	AST_TOKEN_TYPES,
	TSESTree,
	ESLintUtils,
	TSESLint,
} from '@typescript-eslint/experimental-utils';
import { Literal } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { RuleModule, RuleMetaData, RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const ALL_IRREGULARS = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000\u2028\u2029]/u;
const IRREGULAR_WHITESPACE = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000]+/mgu;
const IRREGULAR_LINE_TERMINATORS = /[\u2028\u2029]/mgu;
const LINE_BREAK = /\r\n|[\r\n\u2028\u2029]/gu;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export interface IOptions
{
	skipComments?: boolean,
	skipStrings?: boolean,
	skipRegExps?: boolean,
	skipTemplates?: boolean,
	ignores?: string[],
}

export type IOptionsArray = [IOptions];

export default {

	name: "no-irregular-whitespace",

	meta: {
		type: "problem",

		docs: {
			description: "disallow irregular whitespace",
			category: "Possible Errors",
			recommended: true,
			url: "https://eslint.org/docs/rules/no-irregular-whitespace",
		},

		schema: [
			{
				type: "object",
				properties: {
					skipComments: {
						type: "boolean",
						default: false,
					},
					skipStrings: {
						type: "boolean",
						default: true,
					},
					skipTemplates: {
						type: "boolean",
						default: false,
					},
					skipRegExps: {
						type: "boolean",
						default: false,
					},
					ignores: {
						type: "array",
						items: {
							type: "string",
						},
					},
				},
				additionalProperties: false,
			},
		],
	},

	defaultOptions: ["error", <IOptions>{
		"skipComments": false,
		"skipStrings": false,
		"skipTemplates": false,
		"skipRegExps": false,
		ignores: [],
	}],

	create(context: RuleContext<string, IOptionsArray>)
	{

		// Module store of errors that we have found
		let errors = [];

		// Lookup the `skipComments` option, which defaults to `false`.
		const options = context.options[0] || {};
		const skipComments = !!options.skipComments;
		const skipStrings = options.skipStrings !== false;
		const skipRegExps = !!options.skipRegExps;
		const skipTemplates = !!options.skipTemplates;

		const sourceCode = context.getSourceCode();
		const commentNodes = sourceCode.getAllComments();

		function handleIgnoreRe(ignores: string[])
		{
			if (!ignores || !ignores.length)
			{
				return null;
			}

			let source = ignores
				.map(c =>
				{
					if (c === '\f' || c === '\\f' || c === '\\\\f')
					{
						return '\\\\f';
					}
					else if (c === '\v' || c === '\\v' || c === '\\\\v')
					{
						return '\\\\v';
					}
					else if (c.startsWith('\\\\u'))
					{
						return c;
					}
					else if (c.length === 1)
					{
						return `\\\\u${c.codePointAt(0).toString(16)}`
					}
					else if (c.startsWith('\\\\'))
					{
						return c
					}

					throw new TypeError(`${c} \\u${c.codePointAt(0).toString(16)}`)
				})
				.join("|")
			;

			return new RegExp(source, 'ug')
		}

		const ignoresRe: RegExp = handleIgnoreRe(options.ignores || []);

		/**
		 * remove regexp in ignores
		 * @param {RegExp} re input regexp
		 * @returns {RegExp} new regexp
		 * @private
		 */
		function removeRegexClass(re: RegExp)
		{
			if (!ignoresRe)
			{
				return re;
			}

			let source = re.source.replace(ignoresRe, "");

			return new RegExp(source, re.flags);
		}

		const ALL_IRREGULARS_LOCAL = removeRegexClass(ALL_IRREGULARS);
		const IRREGULAR_WHITESPACE_LOCAL = removeRegexClass(IRREGULAR_WHITESPACE);

		/**
		 * Removes errors that occur inside a string node
		 * @param {ASTNode} node to check for matching errors.
		 * @returns {void}
		 * @private
		 */
		function removeWhitespaceError(node: TSESTree.BaseNode)
		{
			const locStart = node.loc.start;
			const locEnd = node.loc.end;

			errors = errors.filter(({ loc: errorLoc }) =>
			{
				if (errorLoc.line >= locStart.line && errorLoc.line <= locEnd.line)
				{
					if (errorLoc.column >= locStart.column && (errorLoc.column <= locEnd.column || errorLoc.line < locEnd.line))
					{
						return false;
					}
				}
				return true;
			});
		}

		/**
		 * Checks identifier or literal nodes for errors that we are choosing to ignore and calls the relevant methods to remove the errors
		 * @param {ASTNode} node to check for matching errors.
		 * @returns {void}
		 * @private
		 */
		function removeInvalidNodeErrorsInIdentifierOrLiteral(node: TSESTree.Literal)
		{
			const shouldCheckStrings = skipStrings && (typeof node.value === "string");
			const shouldCheckRegExps = skipRegExps && Boolean(node.regex);

			if (shouldCheckStrings || shouldCheckRegExps)
			{

				// If we have irregular characters remove them from the errors list
				if (ALL_IRREGULARS_LOCAL.test(node.raw))
				{
					removeWhitespaceError(node);
				}
			}
		}

		/**
		 * Checks template string literal nodes for errors that we are choosing to ignore and calls the relevant methods to remove the errors
		 * @param {ASTNode} node to check for matching errors.
		 * @returns {void}
		 * @private
		 */
		function removeInvalidNodeErrorsInTemplateLiteral(node: TSESTree.TemplateElement)
		{
			if (typeof node.value.raw === "string")
			{
				if (ALL_IRREGULARS_LOCAL.test(node.value.raw))
				{
					removeWhitespaceError(node);
				}
			}
		}

		/**
		 * Checks comment nodes for errors that we are choosing to ignore and calls the relevant methods to remove the errors
		 * @param {ASTNode} node to check for matching errors.
		 * @returns {void}
		 * @private
		 */
		function removeInvalidNodeErrorsInComment(node: TSESTree.Comment)
		{
			if (ALL_IRREGULARS_LOCAL.test(node.value))
			{
				removeWhitespaceError(node);
			}
		}

		/**
		 * Checks the program source for irregular whitespace
		 * @param {ASTNode} node The program node
		 * @returns {void}
		 * @private
		 */
		function checkForIrregularWhitespace(node: TSESTree.Node)
		{
			const sourceLines = sourceCode.lines;

			sourceLines.forEach((sourceLine, lineIndex) =>
			{
				const lineNumber = lineIndex + 1;
				let match;

				while ((match = IRREGULAR_WHITESPACE_LOCAL.exec(sourceLine)) !== null)
				{
					const location = {
						line: lineNumber,
						column: match.index,
					};

					errors.push({ node, message: "Irregular whitespace not allowed.", loc: location });
				}
			});
		}

		/**
		 * Checks the program source for irregular line terminators
		 * @param {ASTNode} node The program node
		 * @returns {void}
		 * @private
		 */
		function checkForIrregularLineTerminators(node: TSESTree.Node)
		{
			const source = sourceCode.getText(),
				sourceLines = sourceCode.lines,
				linebreaks = source.match(LINE_BREAK);
			let lastLineIndex = -1,
				match;

			while ((match = IRREGULAR_LINE_TERMINATORS.exec(source)) !== null)
			{
				const lineIndex = linebreaks.indexOf(match[0], lastLineIndex + 1) || 0;
				const location = {
					line: lineIndex + 1,
					column: sourceLines[lineIndex].length,
				};

				errors.push({ node, message: "Irregular whitespace not allowed.", loc: location });
				lastLineIndex = lineIndex;
			}
		}

		/**
		 * A no-op function to act as placeholder for comment accumulation when the `skipComments` option is `false`.
		 * @returns {void}
		 * @private
		 */
		function noop()
		{}

		const nodes: {
			//[k in AST_NODE_TYPES]?: (node?: TSESTree.Node) => void
		} & {

			"Program:exit"?: () => void;

			Program?(node: TSESTree.Program): void;
			Identifier?(node: TSESTree.Literal): void;
			Literal?(node: TSESTree.Literal): void;
			TemplateElement?(node: TSESTree.TemplateElement): void;

		} = {};

		if (ALL_IRREGULARS_LOCAL.test(sourceCode.getText()))
		{
			nodes.Program = function (node)
			{

				/*
				 * As we can easily fire warnings for all white space issues with
				 * all the source its simpler to fire them here.
				 * This means we can check all the application code without having
				 * to worry about issues caused in the parser tokens.
				 * When writing this code also evaluating per node was missing out
				 * connecting tokens in some cases.
				 * We can later filter the errors when they are found to be not an
				 * issue in nodes we don't care about.
				 */
				checkForIrregularWhitespace(node);
				checkForIrregularLineTerminators(node);
			};

			nodes.Identifier = removeInvalidNodeErrorsInIdentifierOrLiteral;
			nodes.Literal = removeInvalidNodeErrorsInIdentifierOrLiteral;
			nodes.TemplateElement = skipTemplates ? removeInvalidNodeErrorsInTemplateLiteral : noop;
			nodes["Program:exit"] = function ()
			{
				if (skipComments)
				{

					// First strip errors occurring in comment nodes.
					commentNodes.forEach(removeInvalidNodeErrorsInComment);
				}

				// If we have any errors remaining report on them
				errors.forEach(error => context.report(error));
			};
		}
		else
		{
			nodes.Program = noop;
		}

		return nodes;
	},
} as const;
