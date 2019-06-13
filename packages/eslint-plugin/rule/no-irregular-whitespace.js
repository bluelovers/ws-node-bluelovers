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
            noIrregularWhitespace: "Irregular whitespace not allowed."
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQXNCYixNQUFNLGNBQWMsR0FBRyw2SUFBNkksQ0FBQztBQUNySyxNQUFNLG9CQUFvQixHQUFHLG9JQUFvSSxDQUFDO0FBQ2xLLE1BQU0sMEJBQTBCLEdBQUcsbUJBQW1CLENBQUM7QUFDdkQsTUFBTSxVQUFVLEdBQUcsMkJBQTJCLENBQUM7QUFpQi9DLE1BQU0scUJBQXFCLEdBQUc7SUFFN0IsSUFBSSxFQUFFLHlCQUF5QjtJQUUvQixJQUFJLEVBQUU7UUFDTCxJQUFJLEVBQUUsU0FBUztRQUVmLElBQUksRUFBRTtZQUNMLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixXQUFXLEVBQUUsSUFBSTtZQUNqQixHQUFHLEVBQUUsdURBQXVEO1NBQzVEO1FBRUQsUUFBUSxFQUFFO1lBQ1QscUJBQXFCLEVBQUUsbUNBQW1DO1NBQzFEO1FBRUQsTUFBTSxFQUFFO1lBQ1A7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNYLFlBQVksRUFBRTt3QkFDYixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxXQUFXLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLElBQUk7cUJBQ2I7b0JBQ0QsYUFBYSxFQUFFO3dCQUNkLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxPQUFPLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRC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QUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsRUFDbkQ7WUFDQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsSUFBSTtnQkFHN0I7Ozs7Ozs7OzttQkFTRztnQkFDSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDO1lBRUYsS0FBSyxDQUFDLFVBQVUsR0FBRyw0Q0FBNEMsQ0FBQztZQUNoRSxLQUFLLENBQUMsT0FBTyxHQUFHLDRDQUE0QyxDQUFDO1lBQzdELEtBQUssQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRztnQkFFdkIsSUFBSSxZQUFZLEVBQ2hCO29CQUVDLGlEQUFpRDtvQkFDakQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO2lCQUN2RDtnQkFFRCxpREFBaUQ7Z0JBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDO1NBQ0Y7YUFFRDtZQUNDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0NBQ1EsQ0FBQztBQUVYLGtCQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxvdyB3aGl0ZXNwYWNlIHRoYXQgaXMgbm90IGEgdGFiIG9yIHNwYWNlLCB3aGl0ZXNwYWNlIGluc2lkZSBzdHJpbmdzIGFuZCBjb21tZW50cyBhcmUgYWxsb3dlZFxuICogQGF1dGhvciBKb25hdGhhbiBLaW5nc3RvblxuICogQGF1dGhvciBDaHJpc3RvcGhlIFBvcnRlbmV1dmVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtcblx0QVNUX05PREVfVFlQRVMsXG5cdEFTVF9UT0tFTl9UWVBFUyxcblx0VFNFU1RyZWUsXG5cdEVTTGludFV0aWxzLFxuXHRUU0VTTGludCxcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscyc7XG5pbXBvcnQgeyBMaXRlcmFsIH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXN0cmVlL2Rpc3QvdHMtZXN0cmVlL3RzLWVzdHJlZSc7XG5cbmltcG9ydCB7XG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZU1vZHVsZSxcblx0Ly8gQHRzLWlnbm9yZVxuXHRSdWxlTWV0YURhdGEsXG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZUNvbnRleHQsXG5cdC8vIEB0cy1pZ25vcmVcblx0UmVwb3J0RGVzY3JpcHRvcixcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscy9kaXN0L3RzLWVzbGludCc7XG5cbmNvbnN0IEFMTF9JUlJFR1VMQVJTID0gL1tcXGZcXHZcXHUwMDg1XFx1ZmVmZlxcdTAwYTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAwYlxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XS91O1xuY29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0UgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXSsvbWd1O1xuY29uc3QgSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMgPSAvW1xcdTIwMjhcXHUyMDI5XS9tZ3U7XG5jb25zdCBMSU5FX0JSRUFLID0gL1xcclxcbnxbXFxyXFxuXFx1MjAyOFxcdTIwMjldL2d1O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zXG57XG5cdHNraXBDb21tZW50cz86IGJvb2xlYW4sXG5cdHNraXBTdHJpbmdzPzogYm9vbGVhbixcblx0c2tpcFJlZ0V4cHM/OiBib29sZWFuLFxuXHRza2lwVGVtcGxhdGVzPzogYm9vbGVhbixcblx0aWdub3Jlcz86IHN0cmluZ1tdLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc0FycmF5ID0gW0lPcHRpb25zXTtcblxuY29uc3Qgbm9JcnJlZ3VsYXJXaGl0ZXNwYWNlID0ge1xuXG5cdG5hbWU6IFwibm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIixcblxuXHRtZXRhOiB7XG5cdFx0dHlwZTogXCJwcm9ibGVtXCIsXG5cblx0XHRkb2NzOiB7XG5cdFx0XHRkZXNjcmlwdGlvbjogXCJkaXNhbGxvdyBpcnJlZ3VsYXIgd2hpdGVzcGFjZVwiLFxuXHRcdFx0Y2F0ZWdvcnk6IFwiUG9zc2libGUgRXJyb3JzXCIsXG5cdFx0XHRyZWNvbW1lbmRlZDogdHJ1ZSxcblx0XHRcdHVybDogXCJodHRwczovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiLFxuXHRcdH0sXG5cblx0XHRtZXNzYWdlczoge1xuXHRcdFx0bm9JcnJlZ3VsYXJXaGl0ZXNwYWNlOiBcIklycmVndWxhciB3aGl0ZXNwYWNlIG5vdCBhbGxvd2VkLlwiXG5cdFx0fSxcblxuXHRcdHNjaGVtYTogW1xuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0c2tpcENvbW1lbnRzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFN0cmluZ3M6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBUZW1wbGF0ZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwUmVnRXhwczoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGlnbm9yZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYXJyYXlcIixcblx0XHRcdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblxuXHRkZWZhdWx0T3B0aW9uczogW1xuXHRcdFwiZXJyb3JcIiwgPElPcHRpb25zPntcblx0XHRcdFwic2tpcENvbW1lbnRzXCI6IGZhbHNlLFxuXHRcdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcdFwic2tpcFRlbXBsYXRlc1wiOiBmYWxzZSxcblx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHRpZ25vcmVzOiBbXSxcblx0XHR9LFxuXHRdLFxuXG5cdGNyZWF0ZShjb250ZXh0OiBSdWxlQ29udGV4dDxzdHJpbmcsIElPcHRpb25zQXJyYXk+KVxuXHR7XG5cblx0XHQvLyBNb2R1bGUgc3RvcmUgb2YgZXJyb3JzIHRoYXQgd2UgaGF2ZSBmb3VuZFxuXHRcdGxldCBlcnJvcnM6IFJlcG9ydERlc2NyaXB0b3I8J25vSXJyZWd1bGFyV2hpdGVzcGFjZSc+W10gPSBbXTtcblxuXHRcdC8vIExvb2t1cCB0aGUgYHNraXBDb21tZW50c2Agb3B0aW9uLCB3aGljaCBkZWZhdWx0cyB0byBgZmFsc2VgLlxuXHRcdGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XG5cdFx0Y29uc3Qgc2tpcENvbW1lbnRzID0gISFvcHRpb25zLnNraXBDb21tZW50cztcblx0XHRjb25zdCBza2lwU3RyaW5ncyA9IG9wdGlvbnMuc2tpcFN0cmluZ3MgIT09IGZhbHNlO1xuXHRcdGNvbnN0IHNraXBSZWdFeHBzID0gISFvcHRpb25zLnNraXBSZWdFeHBzO1xuXHRcdGNvbnN0IHNraXBUZW1wbGF0ZXMgPSAhIW9wdGlvbnMuc2tpcFRlbXBsYXRlcztcblxuXHRcdGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKTtcblx0XHRjb25zdCBjb21tZW50Tm9kZXMgPSBzb3VyY2VDb2RlLmdldEFsbENvbW1lbnRzKCk7XG5cblx0XHRmdW5jdGlvbiBoYW5kbGVJZ25vcmVSZShpZ25vcmVzOiBzdHJpbmdbXSlcblx0XHR7XG5cdFx0XHRpZiAoIWlnbm9yZXMgfHwgIWlnbm9yZXMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tZWxzZS1yZXR1cm4sIGluZGVudCAqL1xuXHRcdFx0bGV0IHNvdXJjZSA9IGlnbm9yZXNcblx0XHRcdFx0Lm1hcChjID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoYyA9PT0gXCJcXGZcIiB8fCBjID09PSBcIlxcXFxmXCIgfHwgYyA9PT0gXCJcXFxcXFxcXGZcIilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJcXFxcXFxcXGZcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYyA9PT0gXCJcXHZcIiB8fCBjID09PSBcIlxcXFx2XCIgfHwgYyA9PT0gXCJcXFxcXFxcXHZcIilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJcXFxcXFxcXHZcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5zdGFydHNXaXRoKFwiXFxcXFxcXFx1XCIpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChjLmxlbmd0aCA9PT0gMSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYFxcXFxcXFxcdSR7Yy5jb2RlUG9pbnRBdCgwKS50b1N0cmluZygxNil9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5zdGFydHNXaXRoKFwiXFxcXFxcXFxcIikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGM7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjfSBcXFxcdSR7Yy5jb2RlUG9pbnRBdCgwKS50b1N0cmluZygxNil9YCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5qb2luKFwifFwiKVxuXHRcdFx0O1xuXG5cdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIFwidWdcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaWdub3Jlc1JlOiBSZWdFeHAgPSBoYW5kbGVJZ25vcmVSZShvcHRpb25zLmlnbm9yZXMgfHwgW10pO1xuXG5cdFx0LyoqXG5cdFx0ICogcmVtb3ZlIHJlZ2V4cCBpbiBpZ25vcmVzXG5cdFx0ICogQHBhcmFtIHtSZWdFeHB9IHJlIGlucHV0IHJlZ2V4cFxuXHRcdCAqIEByZXR1cm5zIHtSZWdFeHB9IG5ldyByZWdleHBcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZVJlZ2V4Q2xhc3MocmU6IFJlZ0V4cClcblx0XHR7XG5cdFx0XHRpZiAoIWlnbm9yZXNSZSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc291cmNlID0gcmUuc291cmNlLnJlcGxhY2UoaWdub3Jlc1JlLCBcIlwiKTtcblxuXHRcdFx0cmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCByZS5mbGFncyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgQUxMX0lSUkVHVUxBUlNfTE9DQUwgPSByZW1vdmVSZWdleENsYXNzKEFMTF9JUlJFR1VMQVJTKTtcblx0XHRjb25zdCBJUlJFR1VMQVJfV0hJVEVTUEFDRV9MT0NBTCA9IHJlbW92ZVJlZ2V4Q2xhc3MoSVJSRUdVTEFSX1dISVRFU1BBQ0UpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVtb3ZlcyBlcnJvcnMgdGhhdCBvY2N1ciBpbnNpZGUgYSBzdHJpbmcgbm9kZVxuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGU6IFRTRVNUcmVlLkJhc2VOb2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IGxvY1N0YXJ0ID0gbm9kZS5sb2Muc3RhcnQ7XG5cdFx0XHRjb25zdCBsb2NFbmQgPSBub2RlLmxvYy5lbmQ7XG5cblx0XHRcdGVycm9ycyA9IGVycm9ycy5maWx0ZXIoKHsgbG9jOiBlcnJvckxvYyB9KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmIChlcnJvckxvYy5saW5lID49IGxvY1N0YXJ0LmxpbmUgJiYgZXJyb3JMb2MubGluZSA8PSBsb2NFbmQubGluZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRpZiAoZXJyb3JMb2MuY29sdW1uID49IGxvY1N0YXJ0LmNvbHVtbiAmJiAoZXJyb3JMb2MuY29sdW1uIDw9IGxvY0VuZC5jb2x1bW4gfHwgZXJyb3JMb2MubGluZSA8IGxvY0VuZC5saW5lKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIGlkZW50aWZpZXIgb3IgbGl0ZXJhbCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5JZGVudGlmaWVyT3JMaXRlcmFsKG5vZGU6IFRTRVNUcmVlLkxpdGVyYWwpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2hvdWxkQ2hlY2tTdHJpbmdzID0gc2tpcFN0cmluZ3MgJiYgKHR5cGVvZiBub2RlLnZhbHVlID09PSBcInN0cmluZ1wiKTtcblx0XHRcdGNvbnN0IHNob3VsZENoZWNrUmVnRXhwcyA9IHNraXBSZWdFeHBzICYmIEJvb2xlYW4obm9kZS5yZWdleCk7XG5cblx0XHRcdGlmIChzaG91bGRDaGVja1N0cmluZ3MgfHwgc2hvdWxkQ2hlY2tSZWdFeHBzKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgaXJyZWd1bGFyIGNoYXJhY3RlcnMgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgZXJyb3JzIGxpc3Rcblx0XHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS5yYXcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRlbXBsYXRlIHN0cmluZyBsaXRlcmFsIG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJblRlbXBsYXRlTGl0ZXJhbChub2RlOiBUU0VTVHJlZS5UZW1wbGF0ZUVsZW1lbnQpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBub2RlLnZhbHVlLnJhdyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdHtcblx0XHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS52YWx1ZS5yYXcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIGNvbW1lbnQgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luQ29tbWVudChub2RlOiBUU0VTVHJlZS5Db21tZW50KVxuXHRcdHtcblx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUudmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRoZSBwcm9ncmFtIHNvdXJjZSBmb3IgaXJyZWd1bGFyIHdoaXRlc3BhY2Vcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgVGhlIHByb2dyYW0gbm9kZVxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGU6IFRTRVNUcmVlLk5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc291cmNlTGluZXMgPSBzb3VyY2VDb2RlLmxpbmVzO1xuXG5cdFx0XHRzb3VyY2VMaW5lcy5mb3JFYWNoKChzb3VyY2VMaW5lLCBsaW5lSW5kZXgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxpbmVOdW1iZXIgPSBsaW5lSW5kZXggKyAxO1xuXHRcdFx0XHRsZXQgbWF0Y2g7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaCA9IElSUkVHVUxBUl9XSElURVNQQUNFX0xPQ0FMLmV4ZWMoc291cmNlTGluZSkpICE9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSB7XG5cdFx0XHRcdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxuXHRcdFx0XHRcdFx0Y29sdW1uOiBtYXRjaC5pbmRleCxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0cHVzaEVycm9yKG5vZGUsIGxvY2F0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRoZSBwcm9ncmFtIHNvdXJjZSBmb3IgaXJyZWd1bGFyIGxpbmUgdGVybWluYXRvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgVGhlIHByb2dyYW0gbm9kZVxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hlY2tGb3JJcnJlZ3VsYXJMaW5lVGVybWluYXRvcnMobm9kZTogVFNFU1RyZWUuTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBzb3VyY2UgPSBzb3VyY2VDb2RlLmdldFRleHQoKSxcblx0XHRcdFx0c291cmNlTGluZXMgPSBzb3VyY2VDb2RlLmxpbmVzLFxuXHRcdFx0XHRsaW5lYnJlYWtzID0gc291cmNlLm1hdGNoKExJTkVfQlJFQUspO1xuXHRcdFx0bGV0IGxhc3RMaW5lSW5kZXggPSAtMSxcblx0XHRcdFx0bWF0Y2g7XG5cblx0XHRcdHdoaWxlICgobWF0Y2ggPSBJUlJFR1VMQVJfTElORV9URVJNSU5BVE9SUy5leGVjKHNvdXJjZSkpICE9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBsaW5lSW5kZXggPSBsaW5lYnJlYWtzLmluZGV4T2YobWF0Y2hbMF0sIGxhc3RMaW5lSW5kZXggKyAxKSB8fCAwO1xuXHRcdFx0XHRjb25zdCBsb2NhdGlvbiA9IHtcblx0XHRcdFx0XHRsaW5lOiBsaW5lSW5kZXggKyAxLFxuXHRcdFx0XHRcdGNvbHVtbjogc291cmNlTGluZXNbbGluZUluZGV4XS5sZW5ndGgsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cHVzaEVycm9yKG5vZGUsIGxvY2F0aW9uKTtcblx0XHRcdFx0bGFzdExpbmVJbmRleCA9IGxpbmVJbmRleDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBwdXNoRXJyb3Iobm9kZTogVFNFU1RyZWUuQmFzZU5vZGUsIGxvYzogVFNFU1RyZWUuU291cmNlTG9jYXRpb24gfCBUU0VTVHJlZS5MaW5lQW5kQ29sdW1uRGF0YSlcblx0XHR7XG5cdFx0XHRlcnJvcnMucHVzaCh7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bm9kZSxcblx0XHRcdFx0bWVzc2FnZUlkOiBcIm5vSXJyZWd1bGFyV2hpdGVzcGFjZVwiLFxuXHRcdFx0XHQvL21lc3NhZ2U6IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCIsXG5cdFx0XHRcdGxvYyxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEEgbm8tb3AgZnVuY3Rpb24gdG8gYWN0IGFzIHBsYWNlaG9sZGVyIGZvciBjb21tZW50IGFjY3VtdWxhdGlvbiB3aGVuIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24gaXMgYGZhbHNlYC5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5vb3AoKVxuXHRcdHt9XG5cblx0XHRjb25zdCBub2Rlczoge1xuXHRcdFx0Ly9bayBpbiBBU1RfTk9ERV9UWVBFU10/OiAobm9kZT86IFRTRVNUcmVlLk5vZGUpID0+IHZvaWRcblx0XHR9ICYge1xuXG5cdFx0XHRcIlByb2dyYW06ZXhpdFwiOiAoKSA9PiB2b2lkO1xuXG5cdFx0XHRQcm9ncmFtKG5vZGU6IFRTRVNUcmVlLlByb2dyYW0pOiB2b2lkO1xuXHRcdFx0SWRlbnRpZmllcihub2RlOiBUU0VTVHJlZS5MaXRlcmFsKTogdm9pZDtcblx0XHRcdExpdGVyYWwobm9kZTogVFNFU1RyZWUuTGl0ZXJhbCk6IHZvaWQ7XG5cdFx0XHRUZW1wbGF0ZUVsZW1lbnQobm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KTogdm9pZDtcblxuXHRcdH0gPSB7fSBhcyBhbnk7XG5cblx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChzb3VyY2VDb2RlLmdldFRleHQoKSkpXG5cdFx0e1xuXHRcdFx0bm9kZXMuUHJvZ3JhbSA9IGZ1bmN0aW9uIChub2RlKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIEFzIHdlIGNhbiBlYXNpbHkgZmlyZSB3YXJuaW5ncyBmb3IgYWxsIHdoaXRlIHNwYWNlIGlzc3VlcyB3aXRoXG5cdFx0XHRcdCAqIGFsbCB0aGUgc291cmNlIGl0cyBzaW1wbGVyIHRvIGZpcmUgdGhlbSBoZXJlLlxuXHRcdFx0XHQgKiBUaGlzIG1lYW5zIHdlIGNhbiBjaGVjayBhbGwgdGhlIGFwcGxpY2F0aW9uIGNvZGUgd2l0aG91dCBoYXZpbmdcblx0XHRcdFx0ICogdG8gd29ycnkgYWJvdXQgaXNzdWVzIGNhdXNlZCBpbiB0aGUgcGFyc2VyIHRva2Vucy5cblx0XHRcdFx0ICogV2hlbiB3cml0aW5nIHRoaXMgY29kZSBhbHNvIGV2YWx1YXRpbmcgcGVyIG5vZGUgd2FzIG1pc3Npbmcgb3V0XG5cdFx0XHRcdCAqIGNvbm5lY3RpbmcgdG9rZW5zIGluIHNvbWUgY2FzZXMuXG5cdFx0XHRcdCAqIFdlIGNhbiBsYXRlciBmaWx0ZXIgdGhlIGVycm9ycyB3aGVuIHRoZXkgYXJlIGZvdW5kIHRvIGJlIG5vdCBhblxuXHRcdFx0XHQgKiBpc3N1ZSBpbiBub2RlcyB3ZSBkb24ndCBjYXJlIGFib3V0LlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGUpO1xuXHRcdFx0XHRjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlKTtcblx0XHRcdH07XG5cblx0XHRcdG5vZGVzLklkZW50aWZpZXIgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLkxpdGVyYWwgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLlRlbXBsYXRlRWxlbWVudCA9IHNraXBUZW1wbGF0ZXMgPyByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsIDogbm9vcDtcblx0XHRcdG5vZGVzW1wiUHJvZ3JhbTpleGl0XCJdID0gZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHNraXBDb21tZW50cylcblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0Ly8gRmlyc3Qgc3RyaXAgZXJyb3JzIG9jY3VycmluZyBpbiBjb21tZW50IG5vZGVzLlxuXHRcdFx0XHRcdGNvbW1lbnROb2Rlcy5mb3JFYWNoKHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgYW55IGVycm9ycyByZW1haW5pbmcgcmVwb3J0IG9uIHRoZW1cblx0XHRcdFx0ZXJyb3JzLmZvckVhY2goZXJyb3IgPT4gY29udGV4dC5yZXBvcnQoZXJyb3IpKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRub2Rlcy5Qcm9ncmFtID0gbm9vcDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm9kZXM7XG5cdH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgZGVmYXVsdCBub0lycmVndWxhcldoaXRlc3BhY2VcbiJdfQ==