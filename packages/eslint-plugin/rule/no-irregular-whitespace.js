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
                if (errorLoc.line >= locStart.line && errorLoc.line <= locEnd.line) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQXNCYixNQUFNLGNBQWMsR0FBRyw2SUFBNkksQ0FBQztBQUNySyxNQUFNLG9CQUFvQixHQUFHLG9JQUFvSSxDQUFDO0FBQ2xLLE1BQU0sMEJBQTBCLEdBQUcsbUJBQW1CLENBQUM7QUFDdkQsTUFBTSxVQUFVLEdBQUcsMkJBQTJCLENBQUM7QUFpQi9DLE1BQU0scUJBQXFCLEdBQUc7SUFFN0IsSUFBSSxFQUFFLHlCQUF5QjtJQUUvQixJQUFJLEVBQUU7UUFDTCxJQUFJLEVBQUUsU0FBUztRQUVmLElBQUksRUFBRTtZQUNMLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixXQUFXLEVBQUUsSUFBSTtZQUNqQixHQUFHLEVBQUUsdURBQXVEO1NBQzVEO1FBRUQsUUFBUSxFQUFFO1lBQ1QscUJBQXFCLEVBQUUsbUNBQW1DO1NBQzFEO1FBRUQsTUFBTSxFQUFFO1lBQ1A7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNYLFlBQVksRUFBRTt3QkFDYixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxXQUFXLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLElBQUk7cUJBQ2I7b0JBQ0QsYUFBYSxFQUFFO3dCQUNkLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxPQUFPLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRC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TyxFQUFFLENBQUMsRUFDbkQ7WUFDQyxLQUFLLENBQUMsT0FBTyxHQUFHLFVBQVUsSUFBSTtnQkFHN0I7Ozs7Ozs7OzttQkFTRztnQkFDSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDO1lBRUYsS0FBSyxDQUFDLFVBQVUsR0FBRyw0Q0FBNEMsQ0FBQztZQUNoRSxLQUFLLENBQUMsT0FBTyxHQUFHLDRDQUE0QyxDQUFDO1lBQzdELEtBQUssQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRztnQkFFdkIsSUFBSSxZQUFZLEVBQ2hCO29CQUVDLGlEQUFpRDtvQkFDakQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO2lCQUN2RDtnQkFFRCxpREFBaUQ7Z0JBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDO1NBQ0Y7YUFFRDtZQUNDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0NBQ1EsQ0FBQztBQUVYLGtCQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxvdyB3aGl0ZXNwYWNlIHRoYXQgaXMgbm90IGEgdGFiIG9yIHNwYWNlLCB3aGl0ZXNwYWNlIGluc2lkZSBzdHJpbmdzIGFuZCBjb21tZW50cyBhcmUgYWxsb3dlZFxuICogQGF1dGhvciBKb25hdGhhbiBLaW5nc3RvblxuICogQGF1dGhvciBDaHJpc3RvcGhlIFBvcnRlbmV1dmVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtcblx0QVNUX05PREVfVFlQRVMsXG5cdEFTVF9UT0tFTl9UWVBFUyxcblx0VFNFU1RyZWUsXG5cdEVTTGludFV0aWxzLFxuXHRUU0VTTGludCxcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscyc7XG5pbXBvcnQgeyBMaXRlcmFsIH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXN0cmVlL2Rpc3QvdHMtZXN0cmVlL3RzLWVzdHJlZSc7XG5cbmltcG9ydCB7XG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZU1vZHVsZSxcblx0Ly8gQHRzLWlnbm9yZVxuXHRSdWxlTWV0YURhdGEsXG5cdC8vIEB0cy1pZ25vcmVcblx0UnVsZUNvbnRleHQsXG5cdC8vIEB0cy1pZ25vcmVcblx0UmVwb3J0RGVzY3JpcHRvcixcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscy9kaXN0L3RzLWVzbGludCc7XG5cbmNvbnN0IEFMTF9JUlJFR1VMQVJTID0gL1tcXGZcXHZcXHUwMDg1XFx1ZmVmZlxcdTAwYTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAwYlxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XS91O1xuY29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0UgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXSsvbWd1O1xuY29uc3QgSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMgPSAvW1xcdTIwMjhcXHUyMDI5XS9tZ3U7XG5jb25zdCBMSU5FX0JSRUFLID0gL1xcclxcbnxbXFxyXFxuXFx1MjAyOFxcdTIwMjldL2d1O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zXG57XG5cdHNraXBDb21tZW50cz86IGJvb2xlYW4sXG5cdHNraXBTdHJpbmdzPzogYm9vbGVhbixcblx0c2tpcFJlZ0V4cHM/OiBib29sZWFuLFxuXHRza2lwVGVtcGxhdGVzPzogYm9vbGVhbixcblx0aWdub3Jlcz86IHN0cmluZ1tdLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc0FycmF5ID0gW0lPcHRpb25zXTtcblxuY29uc3Qgbm9JcnJlZ3VsYXJXaGl0ZXNwYWNlID0ge1xuXG5cdG5hbWU6IFwibm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIixcblxuXHRtZXRhOiB7XG5cdFx0dHlwZTogXCJwcm9ibGVtXCIsXG5cblx0XHRkb2NzOiB7XG5cdFx0XHRkZXNjcmlwdGlvbjogXCJkaXNhbGxvdyBpcnJlZ3VsYXIgd2hpdGVzcGFjZVwiLFxuXHRcdFx0Y2F0ZWdvcnk6IFwiUG9zc2libGUgRXJyb3JzXCIsXG5cdFx0XHRyZWNvbW1lbmRlZDogdHJ1ZSxcblx0XHRcdHVybDogXCJodHRwczovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiLFxuXHRcdH0sXG5cblx0XHRtZXNzYWdlczoge1xuXHRcdFx0bm9JcnJlZ3VsYXJXaGl0ZXNwYWNlOiBcIklycmVndWxhciB3aGl0ZXNwYWNlIG5vdCBhbGxvd2VkLlwiXG5cdFx0fSxcblxuXHRcdHNjaGVtYTogW1xuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0c2tpcENvbW1lbnRzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFN0cmluZ3M6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBUZW1wbGF0ZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwUmVnRXhwczoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGlnbm9yZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYXJyYXlcIixcblx0XHRcdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblxuXHRkZWZhdWx0T3B0aW9uczogW1xuXHRcdFwiZXJyb3JcIiwgPElPcHRpb25zPntcblx0XHRcdFwic2tpcENvbW1lbnRzXCI6IGZhbHNlLFxuXHRcdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcdFwic2tpcFRlbXBsYXRlc1wiOiBmYWxzZSxcblx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHRpZ25vcmVzOiBbXSxcblx0XHR9LFxuXHRdLFxuXG5cdGNyZWF0ZShjb250ZXh0OiBSdWxlQ29udGV4dDxzdHJpbmcsIElPcHRpb25zQXJyYXk+KVxuXHR7XG5cblx0XHQvLyBNb2R1bGUgc3RvcmUgb2YgZXJyb3JzIHRoYXQgd2UgaGF2ZSBmb3VuZFxuXHRcdGxldCBlcnJvcnM6IFJlcG9ydERlc2NyaXB0b3JbXSA9IFtdO1xuXG5cdFx0Ly8gTG9va3VwIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24sIHdoaWNoIGRlZmF1bHRzIHRvIGBmYWxzZWAuXG5cdFx0Y29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcblx0XHRjb25zdCBza2lwQ29tbWVudHMgPSAhIW9wdGlvbnMuc2tpcENvbW1lbnRzO1xuXHRcdGNvbnN0IHNraXBTdHJpbmdzID0gb3B0aW9ucy5za2lwU3RyaW5ncyAhPT0gZmFsc2U7XG5cdFx0Y29uc3Qgc2tpcFJlZ0V4cHMgPSAhIW9wdGlvbnMuc2tpcFJlZ0V4cHM7XG5cdFx0Y29uc3Qgc2tpcFRlbXBsYXRlcyA9ICEhb3B0aW9ucy5za2lwVGVtcGxhdGVzO1xuXG5cdFx0Y29uc3Qgc291cmNlQ29kZSA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpO1xuXHRcdGNvbnN0IGNvbW1lbnROb2RlcyA9IHNvdXJjZUNvZGUuZ2V0QWxsQ29tbWVudHMoKTtcblxuXHRcdGZ1bmN0aW9uIGhhbmRsZUlnbm9yZVJlKGlnbm9yZXM6IHN0cmluZ1tdKVxuXHRcdHtcblx0XHRcdGlmICghaWdub3JlcyB8fCAhaWdub3Jlcy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1lbHNlLXJldHVybiwgaW5kZW50ICovXG5cdFx0XHRsZXQgc291cmNlID0gaWdub3Jlc1xuXHRcdFx0XHQubWFwKGMgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChjID09PSBcIlxcZlwiIHx8IGMgPT09IFwiXFxcXGZcIiB8fCBjID09PSBcIlxcXFxcXFxcZlwiKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBcIlxcXFxcXFxcZlwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChjID09PSBcIlxcdlwiIHx8IGMgPT09IFwiXFxcXHZcIiB8fCBjID09PSBcIlxcXFxcXFxcdlwiKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBcIlxcXFxcXFxcdlwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChjLnN0YXJ0c1dpdGgoXCJcXFxcXFxcXHVcIikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKGMubGVuZ3RoID09PSAxKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBgXFxcXFxcXFx1JHtjLmNvZGVQb2ludEF0KDApLnRvU3RyaW5nKDE2KX1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChjLnN0YXJ0c1dpdGgoXCJcXFxcXFxcXFwiKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGAke2N9IFxcXFx1JHtjLmNvZGVQb2ludEF0KDApLnRvU3RyaW5nKDE2KX1gKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmpvaW4oXCJ8XCIpXG5cdFx0XHQ7XG5cblx0XHRcdHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgXCJ1Z1wiKTtcblx0XHR9XG5cblx0XHRjb25zdCBpZ25vcmVzUmU6IFJlZ0V4cCA9IGhhbmRsZUlnbm9yZVJlKG9wdGlvbnMuaWdub3JlcyB8fCBbXSk7XG5cblx0XHQvKipcblx0XHQgKiByZW1vdmUgcmVnZXhwIGluIGlnbm9yZXNcblx0XHQgKiBAcGFyYW0ge1JlZ0V4cH0gcmUgaW5wdXQgcmVnZXhwXG5cdFx0ICogQHJldHVybnMge1JlZ0V4cH0gbmV3IHJlZ2V4cFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlUmVnZXhDbGFzcyhyZTogUmVnRXhwKVxuXHRcdHtcblx0XHRcdGlmICghaWdub3Jlc1JlKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBzb3VyY2UgPSByZS5zb3VyY2UucmVwbGFjZShpZ25vcmVzUmUsIFwiXCIpO1xuXG5cdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIHJlLmZsYWdzKTtcblx0XHR9XG5cblx0XHRjb25zdCBBTExfSVJSRUdVTEFSU19MT0NBTCA9IHJlbW92ZVJlZ2V4Q2xhc3MoQUxMX0lSUkVHVUxBUlMpO1xuXHRcdGNvbnN0IElSUkVHVUxBUl9XSElURVNQQUNFX0xPQ0FMID0gcmVtb3ZlUmVnZXhDbGFzcyhJUlJFR1VMQVJfV0hJVEVTUEFDRSk7XG5cblx0XHQvKipcblx0XHQgKiBSZW1vdmVzIGVycm9ycyB0aGF0IG9jY3VyIGluc2lkZSBhIHN0cmluZyBub2RlXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZTogVFNFU1RyZWUuQmFzZU5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3QgbG9jU3RhcnQgPSBub2RlLmxvYy5zdGFydDtcblx0XHRcdGNvbnN0IGxvY0VuZCA9IG5vZGUubG9jLmVuZDtcblxuXHRcdFx0ZXJyb3JzID0gZXJyb3JzLmZpbHRlcigoeyBsb2M6IGVycm9yTG9jIH0pID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChlcnJvckxvYy5saW5lID49IGxvY1N0YXJ0LmxpbmUgJiYgZXJyb3JMb2MubGluZSA8PSBsb2NFbmQubGluZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlcnJvckxvYy5jb2x1bW4gPj0gbG9jU3RhcnQuY29sdW1uICYmIChlcnJvckxvYy5jb2x1bW4gPD0gbG9jRW5kLmNvbHVtbiB8fCBlcnJvckxvYy5saW5lIDwgbG9jRW5kLmxpbmUpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgaWRlbnRpZmllciBvciBsaXRlcmFsIG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbklkZW50aWZpZXJPckxpdGVyYWwobm9kZTogVFNFU1RyZWUuTGl0ZXJhbClcblx0XHR7XG5cdFx0XHRjb25zdCBzaG91bGRDaGVja1N0cmluZ3MgPSBza2lwU3RyaW5ncyAmJiAodHlwZW9mIG5vZGUudmFsdWUgPT09IFwic3RyaW5nXCIpO1xuXHRcdFx0Y29uc3Qgc2hvdWxkQ2hlY2tSZWdFeHBzID0gc2tpcFJlZ0V4cHMgJiYgQm9vbGVhbihub2RlLnJlZ2V4KTtcblxuXHRcdFx0aWYgKHNob3VsZENoZWNrU3RyaW5ncyB8fCBzaG91bGRDaGVja1JlZ0V4cHMpXG5cdFx0XHR7XG5cblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBpcnJlZ3VsYXIgY2hhcmFjdGVycyByZW1vdmUgdGhlbSBmcm9tIHRoZSBlcnJvcnMgbGlzdFxuXHRcdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnJhdykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGVtcGxhdGUgc3RyaW5nIGxpdGVyYWwgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsKG5vZGU6IFRTRVNUcmVlLlRlbXBsYXRlRWxlbWVudClcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG5vZGUudmFsdWUucmF3ID09PSBcInN0cmluZ1wiKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnZhbHVlLnJhdykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgY29tbWVudCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KG5vZGU6IFRTRVNUcmVlLkNvbW1lbnQpXG5cdFx0e1xuXHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS52YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGhlIHByb2dyYW0gc291cmNlIGZvciBpcnJlZ3VsYXIgd2hpdGVzcGFjZVxuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSBUaGUgcHJvZ3JhbSBub2RlXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjaGVja0ZvcklycmVndWxhcldoaXRlc3BhY2Uobm9kZTogVFNFU1RyZWUuTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBzb3VyY2VMaW5lcyA9IHNvdXJjZUNvZGUubGluZXM7XG5cblx0XHRcdHNvdXJjZUxpbmVzLmZvckVhY2goKHNvdXJjZUxpbmUsIGxpbmVJbmRleCkgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbGluZU51bWJlciA9IGxpbmVJbmRleCArIDE7XG5cdFx0XHRcdGxldCBtYXRjaDtcblxuXHRcdFx0XHR3aGlsZSAoKG1hdGNoID0gSVJSRUdVTEFSX1dISVRFU1BBQ0VfTE9DQUwuZXhlYyhzb3VyY2VMaW5lKSkgIT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBsb2NhdGlvbiA9IHtcblx0XHRcdFx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXG5cdFx0XHRcdFx0XHRjb2x1bW46IG1hdGNoLmluZGV4LFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRwdXNoRXJyb3Iobm9kZSwgbG9jYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGhlIHByb2dyYW0gc291cmNlIGZvciBpcnJlZ3VsYXIgbGluZSB0ZXJtaW5hdG9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSBUaGUgcHJvZ3JhbSBub2RlXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlOiBUU0VTVHJlZS5Ob2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNvdXJjZSA9IHNvdXJjZUNvZGUuZ2V0VGV4dCgpLFxuXHRcdFx0XHRzb3VyY2VMaW5lcyA9IHNvdXJjZUNvZGUubGluZXMsXG5cdFx0XHRcdGxpbmVicmVha3MgPSBzb3VyY2UubWF0Y2goTElORV9CUkVBSyk7XG5cdFx0XHRsZXQgbGFzdExpbmVJbmRleCA9IC0xLFxuXHRcdFx0XHRtYXRjaDtcblxuXHRcdFx0d2hpbGUgKChtYXRjaCA9IElSUkVHVUxBUl9MSU5FX1RFUk1JTkFUT1JTLmV4ZWMoc291cmNlKSkgIT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxpbmVJbmRleCA9IGxpbmVicmVha3MuaW5kZXhPZihtYXRjaFswXSwgbGFzdExpbmVJbmRleCArIDEpIHx8IDA7XG5cdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0ge1xuXHRcdFx0XHRcdGxpbmU6IGxpbmVJbmRleCArIDEsXG5cdFx0XHRcdFx0Y29sdW1uOiBzb3VyY2VMaW5lc1tsaW5lSW5kZXhdLmxlbmd0aCxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRwdXNoRXJyb3Iobm9kZSwgbG9jYXRpb24pO1xuXHRcdFx0XHRsYXN0TGluZUluZGV4ID0gbGluZUluZGV4O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHB1c2hFcnJvcihub2RlOiBUU0VTVHJlZS5CYXNlTm9kZSwgbG9jOiBUU0VTVHJlZS5Tb3VyY2VMb2NhdGlvbiB8IFRTRVNUcmVlLkxpbmVBbmRDb2x1bW5EYXRhKVxuXHRcdHtcblx0XHRcdGVycm9ycy5wdXNoKHtcblx0XHRcdFx0bm9kZSxcblx0XHRcdFx0bWVzc2FnZUlkOiBcIm5vSXJyZWd1bGFyV2hpdGVzcGFjZVwiLFxuXHRcdFx0XHQvL21lc3NhZ2U6IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCIsXG5cdFx0XHRcdGxvYyxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEEgbm8tb3AgZnVuY3Rpb24gdG8gYWN0IGFzIHBsYWNlaG9sZGVyIGZvciBjb21tZW50IGFjY3VtdWxhdGlvbiB3aGVuIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24gaXMgYGZhbHNlYC5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5vb3AoKVxuXHRcdHt9XG5cblx0XHRjb25zdCBub2Rlczoge1xuXHRcdFx0Ly9bayBpbiBBU1RfTk9ERV9UWVBFU10/OiAobm9kZT86IFRTRVNUcmVlLk5vZGUpID0+IHZvaWRcblx0XHR9ICYge1xuXG5cdFx0XHRcIlByb2dyYW06ZXhpdFwiOiAoKSA9PiB2b2lkO1xuXG5cdFx0XHRQcm9ncmFtKG5vZGU6IFRTRVNUcmVlLlByb2dyYW0pOiB2b2lkO1xuXHRcdFx0SWRlbnRpZmllcihub2RlOiBUU0VTVHJlZS5MaXRlcmFsKTogdm9pZDtcblx0XHRcdExpdGVyYWwobm9kZTogVFNFU1RyZWUuTGl0ZXJhbCk6IHZvaWQ7XG5cdFx0XHRUZW1wbGF0ZUVsZW1lbnQobm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KTogdm9pZDtcblxuXHRcdH0gPSB7fSBhcyBhbnk7XG5cblx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChzb3VyY2VDb2RlLmdldFRleHQoKSkpXG5cdFx0e1xuXHRcdFx0bm9kZXMuUHJvZ3JhbSA9IGZ1bmN0aW9uIChub2RlKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIEFzIHdlIGNhbiBlYXNpbHkgZmlyZSB3YXJuaW5ncyBmb3IgYWxsIHdoaXRlIHNwYWNlIGlzc3VlcyB3aXRoXG5cdFx0XHRcdCAqIGFsbCB0aGUgc291cmNlIGl0cyBzaW1wbGVyIHRvIGZpcmUgdGhlbSBoZXJlLlxuXHRcdFx0XHQgKiBUaGlzIG1lYW5zIHdlIGNhbiBjaGVjayBhbGwgdGhlIGFwcGxpY2F0aW9uIGNvZGUgd2l0aG91dCBoYXZpbmdcblx0XHRcdFx0ICogdG8gd29ycnkgYWJvdXQgaXNzdWVzIGNhdXNlZCBpbiB0aGUgcGFyc2VyIHRva2Vucy5cblx0XHRcdFx0ICogV2hlbiB3cml0aW5nIHRoaXMgY29kZSBhbHNvIGV2YWx1YXRpbmcgcGVyIG5vZGUgd2FzIG1pc3Npbmcgb3V0XG5cdFx0XHRcdCAqIGNvbm5lY3RpbmcgdG9rZW5zIGluIHNvbWUgY2FzZXMuXG5cdFx0XHRcdCAqIFdlIGNhbiBsYXRlciBmaWx0ZXIgdGhlIGVycm9ycyB3aGVuIHRoZXkgYXJlIGZvdW5kIHRvIGJlIG5vdCBhblxuXHRcdFx0XHQgKiBpc3N1ZSBpbiBub2RlcyB3ZSBkb24ndCBjYXJlIGFib3V0LlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGUpO1xuXHRcdFx0XHRjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlKTtcblx0XHRcdH07XG5cblx0XHRcdG5vZGVzLklkZW50aWZpZXIgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLkxpdGVyYWwgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLlRlbXBsYXRlRWxlbWVudCA9IHNraXBUZW1wbGF0ZXMgPyByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsIDogbm9vcDtcblx0XHRcdG5vZGVzW1wiUHJvZ3JhbTpleGl0XCJdID0gZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHNraXBDb21tZW50cylcblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0Ly8gRmlyc3Qgc3RyaXAgZXJyb3JzIG9jY3VycmluZyBpbiBjb21tZW50IG5vZGVzLlxuXHRcdFx0XHRcdGNvbW1lbnROb2Rlcy5mb3JFYWNoKHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgYW55IGVycm9ycyByZW1haW5pbmcgcmVwb3J0IG9uIHRoZW1cblx0XHRcdFx0ZXJyb3JzLmZvckVhY2goZXJyb3IgPT4gY29udGV4dC5yZXBvcnQoZXJyb3IpKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRub2Rlcy5Qcm9ncmFtID0gbm9vcDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm9kZXM7XG5cdH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgZGVmYXVsdCBub0lycmVndWxhcldoaXRlc3BhY2VcbiJdfQ==