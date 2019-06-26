/**
 * @fileoverview Rule to disalow whitespace that is not a tab or space, whitespace inside strings and comments are allowed
 * @author Jonathan Kingston
 * @author Christophe Porteneuve
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ALL_IRREGULARS = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000\u2028\u2029]/u;
const IRREGULAR_WHITESPACE = /[\f\v\u0085\ufeff\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u202f\u205f\u3000]+/mgu;
const IRREGULAR_LINE_TERMINATORS = /[\u2028\u2029]/mgu;
const LINE_BREAK = /\r\n|[\r\n\u2028\u2029]/gu;
const ERROR_MESSAGE = "Irregular whitespace not allowed.";
const noIrregularWhitespace = {
    name: "no-irregular-whitespace",
    meta: {
        type: "problem",
        docs: {
            description: "disallow irregular whitespace",
            category: "Possible Errors",
            recommended: true,
            url: "https://eslint.org/docs/rules/no-irregular-whitespace",
        },
        messages: {
            noIrregularWhitespace: ERROR_MESSAGE
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
    defaultOptions: [
        "error", {
            "skipComments": false,
            "skipStrings": false,
            "skipTemplates": false,
            "skipRegExps": false,
            ignores: [],
        },
    ],
    create(context) {
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
        function handleIgnoreRe(ignores) {
            if (!ignores || !ignores.length) {
                return null;
            }
            /* eslint-disable no-else-return, indent */
            let source = ignores
                .map(c => {
                if (c === "\f" || c === "\\f" || c === "\\\\f") {
                    return "\\\\f";
                }
                else if (c === "\v" || c === "\\v" || c === "\\\\v") {
                    return "\\\\v";
                }
                else if (c.startsWith("\\\\u")) {
                    return c;
                }
                else if (c.length === 1) {
                    return `\\\\u${c.codePointAt(0).toString(16)}`;
                }
                else if (c.startsWith("\\\\")) {
                    return c;
                }
                throw new TypeError(`${c} \\u${c.codePointAt(0).toString(16)}`);
            })
                .join("|");
            return new RegExp(source, "ug");
        }
        const ignoresRe = handleIgnoreRe(options.ignores || []);
        /**
         * remove regexp in ignores
         * @param {RegExp} re input regexp
         * @returns {RegExp} new regexp
         * @private
         */
        function removeRegexClass(re) {
            if (!ignoresRe) {
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
        function removeWhitespaceError(node) {
            const locStart = node.loc.start;
            const locEnd = node.loc.end;
            errors = errors.filter(({ loc: errorLoc }) => {
                // @ts-ignore
                if (errorLoc.line >= locStart.line && errorLoc.line <= locEnd.line) {
                    // @ts-ignore
                    if (errorLoc.column >= locStart.column && (errorLoc.column <= locEnd.column || errorLoc.line < locEnd.line)) {
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
        function removeInvalidNodeErrorsInIdentifierOrLiteral(node) {
            const shouldCheckStrings = skipStrings && (typeof node.value === "string");
            const shouldCheckRegExps = skipRegExps && Boolean(node.regex);
            if (shouldCheckStrings || shouldCheckRegExps) {
                // If we have irregular characters remove them from the errors list
                if (ALL_IRREGULARS_LOCAL.test(node.raw)) {
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
        function removeInvalidNodeErrorsInTemplateLiteral(node) {
            if (typeof node.value.raw === "string") {
                if (ALL_IRREGULARS_LOCAL.test(node.value.raw)) {
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
        function removeInvalidNodeErrorsInComment(node) {
            if (ALL_IRREGULARS_LOCAL.test(node.value)) {
                removeWhitespaceError(node);
            }
        }
        /**
         * Checks the program source for irregular whitespace
         * @param {ASTNode} node The program node
         * @returns {void}
         * @private
         */
        function checkForIrregularWhitespace(node) {
            const sourceLines = sourceCode.lines;
            sourceLines.forEach((sourceLine, lineIndex) => {
                const lineNumber = lineIndex + 1;
                let match;
                while ((match = IRREGULAR_WHITESPACE_LOCAL.exec(sourceLine)) !== null) {
                    const location = {
                        line: lineNumber,
                        column: match.index,
                    };
                    pushError(node, location);
                }
            });
        }
        /**
         * Checks the program source for irregular line terminators
         * @param {ASTNode} node The program node
         * @returns {void}
         * @private
         */
        function checkForIrregularLineTerminators(node) {
            const source = sourceCode.getText(), sourceLines = sourceCode.lines, linebreaks = source.match(LINE_BREAK);
            let lastLineIndex = -1, match;
            while ((match = IRREGULAR_LINE_TERMINATORS.exec(source)) !== null) {
                const lineIndex = linebreaks.indexOf(match[0], lastLineIndex + 1) || 0;
                const location = {
                    line: lineIndex + 1,
                    column: sourceLines[lineIndex].length,
                };
                pushError(node, location);
                lastLineIndex = lineIndex;
            }
        }
        function pushError(node, loc) {
            errors.push({
                // @ts-ignore
                node,
                messageId: "noIrregularWhitespace",
                //				message: ERROR_MESSAGE,
                //message: "Irregular whitespace not allowed.",
                loc,
            });
        }
        /**
         * A no-op function to act as placeholder for comment accumulation when the `skipComments` option is `false`.
         * @returns {void}
         * @private
         */
        function noop() { }
        const nodes = {};
        if (ALL_IRREGULARS_LOCAL.test(sourceCode.getText())) {
            nodes.Program = function (node) {
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
            nodes["Program:exit"] = function () {
                if (skipComments) {
                    // First strip errors occurring in comment nodes.
                    commentNodes.forEach(removeInvalidNodeErrorsInComment);
                }
                // If we have any errors remaining report on them
                errors.forEach(error => context.report(error));
            };
        }
        else {
            nodes.Program = noop;
        }
        return nodes;
    },
};
exports.default = noIrregularWhitespace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQXNCYixNQUFNLGNBQWMsR0FBRyw2SUFBNkksQ0FBQztBQUNySyxNQUFNLG9CQUFvQixHQUFHLG9JQUFvSSxDQUFDO0FBQ2xLLE1BQU0sMEJBQTBCLEdBQUcsbUJBQW1CLENBQUM7QUFDdkQsTUFBTSxVQUFVLEdBQUcsMkJBQTJCLENBQUM7QUFpQi9DLE1BQU0sYUFBYSxHQUFHLG1DQUFtQyxDQUFDO0FBRTFELE1BQU0scUJBQXFCLEdBQUc7SUFFN0IsSUFBSSxFQUFFLHlCQUF5QjtJQUUvQixJQUFJLEVBQUU7UUFDTCxJQUFJLEVBQUUsU0FBUztRQUVmLElBQUksRUFBRTtZQUNMLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixXQUFXLEVBQUUsSUFBSTtZQUNqQixHQUFHLEVBQUUsdURBQXVEO1NBQzVEO1FBRUQsUUFBUSxFQUFFO1lBQ1QscUJBQXFCLEVBQUUsYUFBYTtTQUNwQztRQUVELE1BQU0sRUFBRTtZQUNQO2dCQUNDLElBQUksRUFBRSxRQUFRO2dCQUNkLFVBQVUsRUFBRTtvQkFDWCxZQUFZLEVBQUU7d0JBQ2IsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLEtBQUs7cUJBQ2Q7b0JBQ0QsV0FBVyxFQUFFO3dCQUNaLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxJQUFJO3FCQUNiO29CQUNELGFBQWEsRUFBRTt3QkFDZCxJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxXQUFXLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLEtBQUs7cUJBQ2Q7b0JBQ0QsT0FBTyxFQUFFO3dCQUNSLElBQUksRUFBRSxPQUFPO3dCQUNiLEtBQUssRUFBRTs0QkFDTixJQUFJLEVBQUUsUUFBUTt5QkFDZDtxQkFDRDtpQkFDRDtnQkFDRCxvQkFBb0IsRUFBRSxLQUFLO2FBQzNCO1NBQ0Q7S0FDRDtJQUVELGNBQWMsRUFBRTtRQUNmLE9BQU8sRUFBWTtZQUNsQixjQUFjLEVBQUUsS0FBSztZQUNyQixhQUFhLEVBQUUsS0FBSztZQUNwQixlQUFlLEVBQUUsS0FBSztZQUN0QixhQUFhLEVBQUUsS0FBSztZQUNwQixPQUFPLEVBQUUsRUFBRTtTQUNYO0tBQ0Q7SUFFRCxNQUFNLENBQUMsT0FBMkM7UUFHakQsNENBQTRDO1FBQzVDLElBQUksTUFBTSxHQUFnRCxFQUFFLENBQUM7UUFFN0QsK0RBQStEO1FBQy9ELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQzVDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDO1FBQ2xELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzFDLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRTlDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMzQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFakQsU0FBUyxjQUFjLENBQUMsT0FBaUI7WUFFeEMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQy9CO2dCQUNDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCwyQ0FBMkM7WUFDM0MsSUFBSSxNQUFNLEdBQUcsT0FBTztpQkFDbEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUVSLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxPQUFPLEVBQzlDO29CQUNDLE9BQU8sT0FBTyxDQUFDO2lCQUNmO3FCQUNJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxPQUFPLEVBQ25EO29CQUNDLE9BQU8sT0FBTyxDQUFDO2lCQUNmO3FCQUNJLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDOUI7b0JBQ0MsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7cUJBQ0ksSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDdkI7b0JBQ0MsT0FBTyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7aUJBQy9DO3FCQUNJLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFDN0I7b0JBQ0MsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7Z0JBRUQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDVjtZQUVELE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBVyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUVoRTs7Ozs7V0FLRztRQUNILFNBQVMsZ0JBQWdCLENBQUMsRUFBVTtZQUVuQyxJQUFJLENBQUMsU0FBUyxFQUNkO2dCQUNDLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFFRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFOUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxNQUFNLG9CQUFvQixHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlELE1BQU0sMEJBQTBCLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUUxRTs7Ozs7V0FLRztRQUNILFNBQVMscUJBQXFCLENBQUMsSUFBdUI7WUFFckQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFFNUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO2dCQUU1QyxhQUFhO2dCQUNiLElBQUksUUFBUSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksRUFDbEU7b0JBQ0MsYUFBYTtvQkFDYixJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFDM0c7d0JBQ0MsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILFNBQVMsNENBQTRDLENBQUMsSUFBc0I7WUFFM0UsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDM0UsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5RCxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixFQUM1QztnQkFFQyxtRUFBbUU7Z0JBQ25FLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDdkM7b0JBQ0MscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVCO2FBQ0Q7UUFDRixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxTQUFTLHdDQUF3QyxDQUFDLElBQThCO1lBRS9FLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQ3RDO2dCQUNDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQzdDO29CQUNDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1FBQ0YsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxJQUFzQjtZQUUvRCxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3pDO2dCQUNDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxJQUFtQjtZQUV2RCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBRXJDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBRTdDLE1BQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksS0FBSyxDQUFDO2dCQUVWLE9BQU8sQ0FBQyxLQUFLLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUNyRTtvQkFDQyxNQUFNLFFBQVEsR0FBRzt3QkFDaEIsSUFBSSxFQUFFLFVBQVU7d0JBQ2hCLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSztxQkFDbkIsQ0FBQztvQkFFRixTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUMxQjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxJQUFtQjtZQUU1RCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQ2xDLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUM5QixVQUFVLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsRUFDckIsS0FBSyxDQUFDO1lBRVAsT0FBTyxDQUFDLEtBQUssR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQ2pFO2dCQUNDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZFLE1BQU0sUUFBUSxHQUFHO29CQUNoQixJQUFJLEVBQUUsU0FBUyxHQUFHLENBQUM7b0JBQ25CLE1BQU0sRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTTtpQkFDckMsQ0FBQztnQkFFRixTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUMxQixhQUFhLEdBQUcsU0FBUyxDQUFDO2FBQzFCO1FBQ0YsQ0FBQztRQUVELFNBQVMsU0FBUyxDQUFDLElBQXVCLEVBQUUsR0FBeUQ7WUFFcEcsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDWCxhQUFhO2dCQUNiLElBQUk7Z0JBQ0osU0FBUyxFQUFFLHVCQUF1QjtnQkFDdEMsNkJBQTZCO2dCQUN6QiwrQ0FBK0M7Z0JBQy9DLEdBQUc7YUFDSCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILFNBQVMsSUFBSSxLQUNaLENBQUM7UUFFRixNQUFNLEtBQUssR0FXUCxFQUFTLENBQUM7UUFFZCxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsRUFDbkQ7WUFDQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsSUFBSTtnQkFHN0I7Ozs7Ozs7OzttQkFTRztnQkFDSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDO1lBRUYsS0FBSyxDQUFDLFVBQVUsR0FBRyw0Q0FBNEMsQ0FBQztZQUNoRSxLQUFLLENBQUMsT0FBTyxHQUFHLDRDQUE0QyxDQUFDO1lBQzdELEtBQUssQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRztnQkFFdkIsSUFBSSxZQUFZLEVBQ2hCO29CQUVDLGlEQUFpRDtvQkFDakQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO2lCQUN2RDtnQkFFRCxpREFBaUQ7Z0JBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDO1NBQ0Y7YUFFRDtZQUNDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0NBQ1EsQ0FBQztBQUVYLGtCQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxvdyB3aGl0ZXNwYWNlIHRoYXQgaXMgbm90IGEgdGFiIG9yIHNwYWNlLCB3aGl0ZXNwYWNlIGluc2lkZSBzdHJpbmdzIGFuZCBjb21tZW50cyBhcmUgYWxsb3dlZFxuICogQGF1dGhvciBKb25hdGhhbiBLaW5nc3RvblxuICogQGF1dGhvciBDaHJpc3RvcGhlIFBvcnRlbmV1dmVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtcblx0QVNUX05PREVfVFlQRVMsXG5cdEFTVF9UT0tFTl9UWVBFUyxcblx0VFNFU1RyZWUsXG5cdEVTTGludFV0aWxzLFxuXHRUU0VTTGludCxcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscyc7XG5pbXBvcnQgeyBMaXRlcmFsIH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXN0cmVlL2Rpc3QvdHMtZXN0cmVlL3RzLWVzdHJlZSc7XG5cbmltcG9ydCB7XG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZU1vZHVsZSxcblx0Ly8gQHRzLWlnbm9yZVxuXHRSdWxlTWV0YURhdGEsXG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZUNvbnRleHQsXG5cdC8vIEB0cy1pZ25vcmVcblx0UmVwb3J0RGVzY3JpcHRvcixcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscy9kaXN0L3RzLWVzbGludCc7XG5cbmNvbnN0IEFMTF9JUlJFR1VMQVJTID0gL1tcXGZcXHZcXHUwMDg1XFx1ZmVmZlxcdTAwYTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAwYlxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XS91O1xuY29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0UgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXSsvbWd1O1xuY29uc3QgSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMgPSAvW1xcdTIwMjhcXHUyMDI5XS9tZ3U7XG5jb25zdCBMSU5FX0JSRUFLID0gL1xcclxcbnxbXFxyXFxuXFx1MjAyOFxcdTIwMjldL2d1O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zXG57XG5cdHNraXBDb21tZW50cz86IGJvb2xlYW4sXG5cdHNraXBTdHJpbmdzPzogYm9vbGVhbixcblx0c2tpcFJlZ0V4cHM/OiBib29sZWFuLFxuXHRza2lwVGVtcGxhdGVzPzogYm9vbGVhbixcblx0aWdub3Jlcz86IHN0cmluZ1tdLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc0FycmF5ID0gW0lPcHRpb25zXTtcblxuY29uc3QgRVJST1JfTUVTU0FHRSA9IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCI7XG5cbmNvbnN0IG5vSXJyZWd1bGFyV2hpdGVzcGFjZSA9IHtcblxuXHRuYW1lOiBcIm5vLWlycmVndWxhci13aGl0ZXNwYWNlXCIsXG5cblx0bWV0YToge1xuXHRcdHR5cGU6IFwicHJvYmxlbVwiLFxuXG5cdFx0ZG9jczoge1xuXHRcdFx0ZGVzY3JpcHRpb246IFwiZGlzYWxsb3cgaXJyZWd1bGFyIHdoaXRlc3BhY2VcIixcblx0XHRcdGNhdGVnb3J5OiBcIlBvc3NpYmxlIEVycm9yc1wiLFxuXHRcdFx0cmVjb21tZW5kZWQ6IHRydWUsXG5cdFx0XHR1cmw6IFwiaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIixcblx0XHR9LFxuXG5cdFx0bWVzc2FnZXM6IHtcblx0XHRcdG5vSXJyZWd1bGFyV2hpdGVzcGFjZTogRVJST1JfTUVTU0FHRVxuXHRcdH0sXG5cblx0XHRzY2hlbWE6IFtcblx0XHRcdHtcblx0XHRcdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdHNraXBDb21tZW50czoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBTdHJpbmdzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwVGVtcGxhdGVzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFJlZ0V4cHM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRpZ25vcmVzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImFycmF5XCIsXG5cdFx0XHRcdFx0XHRpdGVtczoge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdF0sXG5cdH0sXG5cblx0ZGVmYXVsdE9wdGlvbnM6IFtcblx0XHRcImVycm9yXCIsIDxJT3B0aW9ucz57XG5cdFx0XHRcInNraXBDb21tZW50c1wiOiBmYWxzZSxcblx0XHRcdFwic2tpcFN0cmluZ3NcIjogZmFsc2UsXG5cdFx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XHRcInNraXBSZWdFeHBzXCI6IGZhbHNlLFxuXHRcdFx0aWdub3JlczogW10sXG5cdFx0fSxcblx0XSxcblxuXHRjcmVhdGUoY29udGV4dDogUnVsZUNvbnRleHQ8c3RyaW5nLCBJT3B0aW9uc0FycmF5Pilcblx0e1xuXG5cdFx0Ly8gTW9kdWxlIHN0b3JlIG9mIGVycm9ycyB0aGF0IHdlIGhhdmUgZm91bmRcblx0XHRsZXQgZXJyb3JzOiBSZXBvcnREZXNjcmlwdG9yPCdub0lycmVndWxhcldoaXRlc3BhY2UnPltdID0gW107XG5cblx0XHQvLyBMb29rdXAgdGhlIGBza2lwQ29tbWVudHNgIG9wdGlvbiwgd2hpY2ggZGVmYXVsdHMgdG8gYGZhbHNlYC5cblx0XHRjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xuXHRcdGNvbnN0IHNraXBDb21tZW50cyA9ICEhb3B0aW9ucy5za2lwQ29tbWVudHM7XG5cdFx0Y29uc3Qgc2tpcFN0cmluZ3MgPSBvcHRpb25zLnNraXBTdHJpbmdzICE9PSBmYWxzZTtcblx0XHRjb25zdCBza2lwUmVnRXhwcyA9ICEhb3B0aW9ucy5za2lwUmVnRXhwcztcblx0XHRjb25zdCBza2lwVGVtcGxhdGVzID0gISFvcHRpb25zLnNraXBUZW1wbGF0ZXM7XG5cblx0XHRjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XG5cdFx0Y29uc3QgY29tbWVudE5vZGVzID0gc291cmNlQ29kZS5nZXRBbGxDb21tZW50cygpO1xuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlSWdub3JlUmUoaWdub3Jlczogc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0aWYgKCFpZ25vcmVzIHx8ICFpZ25vcmVzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdC8qIGVzbGludC1kaXNhYmxlIG5vLWVsc2UtcmV0dXJuLCBpbmRlbnQgKi9cblx0XHRcdGxldCBzb3VyY2UgPSBpZ25vcmVzXG5cdFx0XHRcdC5tYXAoYyA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGMgPT09IFwiXFxmXCIgfHwgYyA9PT0gXCJcXFxcZlwiIHx8IGMgPT09IFwiXFxcXFxcXFxmXCIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiXFxcXFxcXFxmXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGMgPT09IFwiXFx2XCIgfHwgYyA9PT0gXCJcXFxcdlwiIHx8IGMgPT09IFwiXFxcXFxcXFx2XCIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiXFxcXFxcXFx2XCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGMuc3RhcnRzV2l0aChcIlxcXFxcXFxcdVwiKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5sZW5ndGggPT09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGBcXFxcXFxcXHUke2MuY29kZVBvaW50QXQoMCkudG9TdHJpbmcoMTYpfWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGMuc3RhcnRzV2l0aChcIlxcXFxcXFxcXCIpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYCR7Y30gXFxcXHUke2MuY29kZVBvaW50QXQoMCkudG9TdHJpbmcoMTYpfWApO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuam9pbihcInxcIilcblx0XHRcdDtcblxuXHRcdFx0cmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCBcInVnXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlnbm9yZXNSZTogUmVnRXhwID0gaGFuZGxlSWdub3JlUmUob3B0aW9ucy5pZ25vcmVzIHx8IFtdKTtcblxuXHRcdC8qKlxuXHRcdCAqIHJlbW92ZSByZWdleHAgaW4gaWdub3Jlc1xuXHRcdCAqIEBwYXJhbSB7UmVnRXhwfSByZSBpbnB1dCByZWdleHBcblx0XHQgKiBAcmV0dXJucyB7UmVnRXhwfSBuZXcgcmVnZXhwXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVSZWdleENsYXNzKHJlOiBSZWdFeHApXG5cdFx0e1xuXHRcdFx0aWYgKCFpZ25vcmVzUmUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiByZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHNvdXJjZSA9IHJlLnNvdXJjZS5yZXBsYWNlKGlnbm9yZXNSZSwgXCJcIik7XG5cblx0XHRcdHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgcmUuZmxhZ3MpO1xuXHRcdH1cblxuXHRcdGNvbnN0IEFMTF9JUlJFR1VMQVJTX0xPQ0FMID0gcmVtb3ZlUmVnZXhDbGFzcyhBTExfSVJSRUdVTEFSUyk7XG5cdFx0Y29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0VfTE9DQUwgPSByZW1vdmVSZWdleENsYXNzKElSUkVHVUxBUl9XSElURVNQQUNFKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZXMgZXJyb3JzIHRoYXQgb2NjdXIgaW5zaWRlIGEgc3RyaW5nIG5vZGVcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlOiBUU0VTVHJlZS5CYXNlTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBsb2NTdGFydCA9IG5vZGUubG9jLnN0YXJ0O1xuXHRcdFx0Y29uc3QgbG9jRW5kID0gbm9kZS5sb2MuZW5kO1xuXG5cdFx0XHRlcnJvcnMgPSBlcnJvcnMuZmlsdGVyKCh7IGxvYzogZXJyb3JMb2MgfSkgPT5cblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoZXJyb3JMb2MubGluZSA+PSBsb2NTdGFydC5saW5lICYmIGVycm9yTG9jLmxpbmUgPD0gbG9jRW5kLmxpbmUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0aWYgKGVycm9yTG9jLmNvbHVtbiA+PSBsb2NTdGFydC5jb2x1bW4gJiYgKGVycm9yTG9jLmNvbHVtbiA8PSBsb2NFbmQuY29sdW1uIHx8IGVycm9yTG9jLmxpbmUgPCBsb2NFbmQubGluZSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyBpZGVudGlmaWVyIG9yIGxpdGVyYWwgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbChub2RlOiBUU0VTVHJlZS5MaXRlcmFsKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNob3VsZENoZWNrU3RyaW5ncyA9IHNraXBTdHJpbmdzICYmICh0eXBlb2Ygbm9kZS52YWx1ZSA9PT0gXCJzdHJpbmdcIik7XG5cdFx0XHRjb25zdCBzaG91bGRDaGVja1JlZ0V4cHMgPSBza2lwUmVnRXhwcyAmJiBCb29sZWFuKG5vZGUucmVnZXgpO1xuXG5cdFx0XHRpZiAoc2hvdWxkQ2hlY2tTdHJpbmdzIHx8IHNob3VsZENoZWNrUmVnRXhwcylcblx0XHRcdHtcblxuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGlycmVndWxhciBjaGFyYWN0ZXJzIHJlbW92ZSB0aGVtIGZyb20gdGhlIGVycm9ycyBsaXN0XG5cdFx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUucmF3KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0ZW1wbGF0ZSBzdHJpbmcgbGl0ZXJhbCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5UZW1wbGF0ZUxpdGVyYWwobm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2Ygbm9kZS52YWx1ZS5yYXcgPT09IFwic3RyaW5nXCIpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUudmFsdWUucmF3KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyBjb21tZW50IG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbkNvbW1lbnQobm9kZTogVFNFU1RyZWUuQ29tbWVudClcblx0XHR7XG5cdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnZhbHVlKSlcblx0XHRcdHtcblx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0aGUgcHJvZ3JhbSBzb3VyY2UgZm9yIGlycmVndWxhciB3aGl0ZXNwYWNlXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIFRoZSBwcm9ncmFtIG5vZGVcblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoZWNrRm9ySXJyZWd1bGFyV2hpdGVzcGFjZShub2RlOiBUU0VTVHJlZS5Ob2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNvdXJjZUxpbmVzID0gc291cmNlQ29kZS5saW5lcztcblxuXHRcdFx0c291cmNlTGluZXMuZm9yRWFjaCgoc291cmNlTGluZSwgbGluZUluZGV4KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBsaW5lTnVtYmVyID0gbGluZUluZGV4ICsgMTtcblx0XHRcdFx0bGV0IG1hdGNoO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2ggPSBJUlJFR1VMQVJfV0hJVEVTUEFDRV9MT0NBTC5leGVjKHNvdXJjZUxpbmUpKSAhPT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0ge1xuXHRcdFx0XHRcdFx0bGluZTogbGluZU51bWJlcixcblx0XHRcdFx0XHRcdGNvbHVtbjogbWF0Y2guaW5kZXgsXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdHB1c2hFcnJvcihub2RlLCBsb2NhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0aGUgcHJvZ3JhbSBzb3VyY2UgZm9yIGlycmVndWxhciBsaW5lIHRlcm1pbmF0b3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIFRoZSBwcm9ncmFtIG5vZGVcblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoZWNrRm9ySXJyZWd1bGFyTGluZVRlcm1pbmF0b3JzKG5vZGU6IFRTRVNUcmVlLk5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc291cmNlID0gc291cmNlQ29kZS5nZXRUZXh0KCksXG5cdFx0XHRcdHNvdXJjZUxpbmVzID0gc291cmNlQ29kZS5saW5lcyxcblx0XHRcdFx0bGluZWJyZWFrcyA9IHNvdXJjZS5tYXRjaChMSU5FX0JSRUFLKTtcblx0XHRcdGxldCBsYXN0TGluZUluZGV4ID0gLTEsXG5cdFx0XHRcdG1hdGNoO1xuXG5cdFx0XHR3aGlsZSAoKG1hdGNoID0gSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMuZXhlYyhzb3VyY2UpKSAhPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbGluZUluZGV4ID0gbGluZWJyZWFrcy5pbmRleE9mKG1hdGNoWzBdLCBsYXN0TGluZUluZGV4ICsgMSkgfHwgMDtcblx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSB7XG5cdFx0XHRcdFx0bGluZTogbGluZUluZGV4ICsgMSxcblx0XHRcdFx0XHRjb2x1bW46IHNvdXJjZUxpbmVzW2xpbmVJbmRleF0ubGVuZ3RoLFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHB1c2hFcnJvcihub2RlLCBsb2NhdGlvbik7XG5cdFx0XHRcdGxhc3RMaW5lSW5kZXggPSBsaW5lSW5kZXg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcHVzaEVycm9yKG5vZGU6IFRTRVNUcmVlLkJhc2VOb2RlLCBsb2M6IFRTRVNUcmVlLlNvdXJjZUxvY2F0aW9uIHwgVFNFU1RyZWUuTGluZUFuZENvbHVtbkRhdGEpXG5cdFx0e1xuXHRcdFx0ZXJyb3JzLnB1c2goe1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdG5vZGUsXG5cdFx0XHRcdG1lc3NhZ2VJZDogXCJub0lycmVndWxhcldoaXRlc3BhY2VcIixcbi8vXHRcdFx0XHRtZXNzYWdlOiBFUlJPUl9NRVNTQUdFLFxuXHRcdFx0XHQvL21lc3NhZ2U6IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCIsXG5cdFx0XHRcdGxvYyxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEEgbm8tb3AgZnVuY3Rpb24gdG8gYWN0IGFzIHBsYWNlaG9sZGVyIGZvciBjb21tZW50IGFjY3VtdWxhdGlvbiB3aGVuIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24gaXMgYGZhbHNlYC5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5vb3AoKVxuXHRcdHt9XG5cblx0XHRjb25zdCBub2Rlczoge1xuXHRcdFx0Ly9bayBpbiBBU1RfTk9ERV9UWVBFU10/OiAobm9kZT86IFRTRVNUcmVlLk5vZGUpID0+IHZvaWRcblx0XHR9ICYge1xuXG5cdFx0XHRcIlByb2dyYW06ZXhpdFwiOiAoKSA9PiB2b2lkO1xuXG5cdFx0XHRQcm9ncmFtKG5vZGU6IFRTRVNUcmVlLlByb2dyYW0pOiB2b2lkO1xuXHRcdFx0SWRlbnRpZmllcihub2RlOiBUU0VTVHJlZS5MaXRlcmFsKTogdm9pZDtcblx0XHRcdExpdGVyYWwobm9kZTogVFNFU1RyZWUuTGl0ZXJhbCk6IHZvaWQ7XG5cdFx0XHRUZW1wbGF0ZUVsZW1lbnQobm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KTogdm9pZDtcblxuXHRcdH0gPSB7fSBhcyBhbnk7XG5cblx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChzb3VyY2VDb2RlLmdldFRleHQoKSkpXG5cdFx0e1xuXHRcdFx0bm9kZXMuUHJvZ3JhbSA9IGZ1bmN0aW9uIChub2RlKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIEFzIHdlIGNhbiBlYXNpbHkgZmlyZSB3YXJuaW5ncyBmb3IgYWxsIHdoaXRlIHNwYWNlIGlzc3VlcyB3aXRoXG5cdFx0XHRcdCAqIGFsbCB0aGUgc291cmNlIGl0cyBzaW1wbGVyIHRvIGZpcmUgdGhlbSBoZXJlLlxuXHRcdFx0XHQgKiBUaGlzIG1lYW5zIHdlIGNhbiBjaGVjayBhbGwgdGhlIGFwcGxpY2F0aW9uIGNvZGUgd2l0aG91dCBoYXZpbmdcblx0XHRcdFx0ICogdG8gd29ycnkgYWJvdXQgaXNzdWVzIGNhdXNlZCBpbiB0aGUgcGFyc2VyIHRva2Vucy5cblx0XHRcdFx0ICogV2hlbiB3cml0aW5nIHRoaXMgY29kZSBhbHNvIGV2YWx1YXRpbmcgcGVyIG5vZGUgd2FzIG1pc3Npbmcgb3V0XG5cdFx0XHRcdCAqIGNvbm5lY3RpbmcgdG9rZW5zIGluIHNvbWUgY2FzZXMuXG5cdFx0XHRcdCAqIFdlIGNhbiBsYXRlciBmaWx0ZXIgdGhlIGVycm9ycyB3aGVuIHRoZXkgYXJlIGZvdW5kIHRvIGJlIG5vdCBhblxuXHRcdFx0XHQgKiBpc3N1ZSBpbiBub2RlcyB3ZSBkb24ndCBjYXJlIGFib3V0LlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGUpO1xuXHRcdFx0XHRjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlKTtcblx0XHRcdH07XG5cblx0XHRcdG5vZGVzLklkZW50aWZpZXIgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLkxpdGVyYWwgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLlRlbXBsYXRlRWxlbWVudCA9IHNraXBUZW1wbGF0ZXMgPyByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsIDogbm9vcDtcblx0XHRcdG5vZGVzW1wiUHJvZ3JhbTpleGl0XCJdID0gZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHNraXBDb21tZW50cylcblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0Ly8gRmlyc3Qgc3RyaXAgZXJyb3JzIG9jY3VycmluZyBpbiBjb21tZW50IG5vZGVzLlxuXHRcdFx0XHRcdGNvbW1lbnROb2Rlcy5mb3JFYWNoKHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgYW55IGVycm9ycyByZW1haW5pbmcgcmVwb3J0IG9uIHRoZW1cblx0XHRcdFx0ZXJyb3JzLmZvckVhY2goZXJyb3IgPT4gY29udGV4dC5yZXBvcnQoZXJyb3IpKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRub2Rlcy5Qcm9ncmFtID0gbm9vcDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm9kZXM7XG5cdH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgZGVmYXVsdCBub0lycmVndWxhcldoaXRlc3BhY2VcbiJdfQ==