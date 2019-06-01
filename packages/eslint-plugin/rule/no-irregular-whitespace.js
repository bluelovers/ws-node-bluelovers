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
exports.default = {
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
    defaultOptions: ["error", {
            "skipComments": false,
            "skipStrings": false,
            "skipTemplates": false,
            "skipRegExps": false,
            ignores: [],
        }],
    create(context) {
        // Module store of errors that we have found
        let errors = [];
        // Lookup the `skipComments` option, which defaults to `false`.
        const options = context.options[0] || {};
        const skipComments = !!options.skipComments;
        const skipStrings = options.skipStrings !== false;
        const skipRegExps = !!options.skipRegExps;
        const skipTemplates = !!options.skipTemplates;
        const ignores = options.ignores || [];
        const ignoresRe = ignores.length && new RegExp(ignores.map(c => `${c.codePointAt(0).toString(16)}`).join("|"), "gu");
        const sourceCode = context.getSourceCode();
        const commentNodes = sourceCode.getAllComments();
        /**
         * remove regexp in ignores
         * @param {RegExp} re input regexp
         * @returns {RegExp} new regexp
         * @private
         */
        function removeRegexClass(re) {
            if (!ignores.length) {
                return re;
            }
            return new RegExp(re.source.replace(ignoresRe, ""), re.flags);
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
        function checkForIrregularLineTerminators(node) {
            const source = sourceCode.getText(), sourceLines = sourceCode.lines, linebreaks = source.match(LINE_BREAK);
            let lastLineIndex = -1, match;
            while ((match = IRREGULAR_LINE_TERMINATORS.exec(source)) !== null) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQVliLE1BQU0sY0FBYyxHQUFHLDZJQUE2SSxDQUFDO0FBQ3JLLE1BQU0sb0JBQW9CLEdBQUcsb0lBQW9JLENBQUM7QUFDbEssTUFBTSwwQkFBMEIsR0FBRyxtQkFBbUIsQ0FBQztBQUN2RCxNQUFNLFVBQVUsR0FBRywyQkFBMkIsQ0FBQztBQWlCL0Msa0JBQWU7SUFFZCxJQUFJLEVBQUUseUJBQXlCO0lBRS9CLElBQUksRUFBRTtRQUNMLElBQUksRUFBRSxTQUFTO1FBRWYsSUFBSSxFQUFFO1lBQ0wsV0FBVyxFQUFFLCtCQUErQjtZQUM1QyxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEdBQUcsRUFBRSx1REFBdUQ7U0FDNUQ7UUFFRCxNQUFNLEVBQUU7WUFDUDtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1gsWUFBWSxFQUFFO3dCQUNiLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsSUFBSTtxQkFDYjtvQkFDRCxhQUFhLEVBQUU7d0JBQ2QsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLEtBQUs7cUJBQ2Q7b0JBQ0QsV0FBVyxFQUFFO3dCQUNaLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELE9BQU8sRUFBRTt3QkFDUixJQUFJLEVBQUUsT0FBTzt3QkFDYixLQUFLLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7cUJBQ0Q7aUJBQ0Q7Z0JBQ0Qsb0JBQW9CLEVBQUUsS0FB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QUlHO1FBQ0gsU0FBUyxJQUFJLEtBQ1osQ0FBQztRQUVGLE1BQU0sS0FBSyxHQVdQLEVBQUUsQ0FBQztRQUVQLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUNuRDtZQUNDLEtBQUssQ0FBQyxPQUFPLEdBQUcsVUFBVSxJQUFJO2dCQUc3Qjs7Ozs7Ozs7O21CQVNHO2dCQUNILDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUM7WUFFRixLQUFLLENBQUMsVUFBVSxHQUFHLDRDQUE0QyxDQUFDO1lBQ2hFLEtBQUssQ0FBQyxPQUFPLEdBQUcsNENBQTRDLENBQUM7WUFDN0QsS0FBSyxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDeEYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHO2dCQUV2QixJQUFJLFlBQVksRUFDaEI7b0JBRUMsaURBQWlEO29CQUNqRCxZQUFZLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7aUJBQ3ZEO2dCQUVELGlEQUFpRDtnQkFDakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUM7U0FDRjthQUVEO1lBQ0MsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDckI7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7Q0FDUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxvdyB3aGl0ZXNwYWNlIHRoYXQgaXMgbm90IGEgdGFiIG9yIHNwYWNlLCB3aGl0ZXNwYWNlIGluc2lkZSBzdHJpbmdzIGFuZCBjb21tZW50cyBhcmUgYWxsb3dlZFxuICogQGF1dGhvciBKb25hdGhhbiBLaW5nc3RvblxuICogQGF1dGhvciBDaHJpc3RvcGhlIFBvcnRlbmV1dmVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHtcblx0QVNUX05PREVfVFlQRVMsXG5cdEFTVF9UT0tFTl9UWVBFUyxcblx0VFNFU1RyZWUsXG5cdEVTTGludFV0aWxzLFxuXHRUU0VTTGludCxcbn0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscyc7XG5pbXBvcnQgeyBMaXRlcmFsIH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXN0cmVlL2Rpc3QvdHMtZXN0cmVlL3RzLWVzdHJlZSc7XG5pbXBvcnQgeyBSdWxlTW9kdWxlLCBSdWxlTWV0YURhdGEsIFJ1bGVDb250ZXh0IH0gZnJvbSAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGVyaW1lbnRhbC11dGlscy9kaXN0L3RzLWVzbGludCc7XG5cbmNvbnN0IEFMTF9JUlJFR1VMQVJTID0gL1tcXGZcXHZcXHUwMDg1XFx1ZmVmZlxcdTAwYTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAwYlxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XS91O1xuY29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0UgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXSsvbWd1O1xuY29uc3QgSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMgPSAvW1xcdTIwMjhcXHUyMDI5XS9tZ3U7XG5jb25zdCBMSU5FX0JSRUFLID0gL1xcclxcbnxbXFxyXFxuXFx1MjAyOFxcdTIwMjldL2d1O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zXG57XG5cdHNraXBDb21tZW50cz86IGJvb2xlYW4sXG5cdHNraXBTdHJpbmdzPzogYm9vbGVhbixcblx0c2tpcFJlZ0V4cHM/OiBib29sZWFuLFxuXHRza2lwVGVtcGxhdGVzPzogYm9vbGVhbixcblx0aWdub3Jlcz86IHN0cmluZ1tdLFxufVxuXG5leHBvcnQgdHlwZSBJT3B0aW9uc0FycmF5ID0gW0lPcHRpb25zXTtcblxuZXhwb3J0IGRlZmF1bHQge1xuXG5cdG5hbWU6IFwibm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIixcblxuXHRtZXRhOiB7XG5cdFx0dHlwZTogXCJwcm9ibGVtXCIsXG5cblx0XHRkb2NzOiB7XG5cdFx0XHRkZXNjcmlwdGlvbjogXCJkaXNhbGxvdyBpcnJlZ3VsYXIgd2hpdGVzcGFjZVwiLFxuXHRcdFx0Y2F0ZWdvcnk6IFwiUG9zc2libGUgRXJyb3JzXCIsXG5cdFx0XHRyZWNvbW1lbmRlZDogdHJ1ZSxcblx0XHRcdHVybDogXCJodHRwczovL2VzbGludC5vcmcvZG9jcy9ydWxlcy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiLFxuXHRcdH0sXG5cblx0XHRzY2hlbWE6IFtcblx0XHRcdHtcblx0XHRcdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdHNraXBDb21tZW50czoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBTdHJpbmdzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IHRydWUsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwVGVtcGxhdGVzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFJlZ0V4cHM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRpZ25vcmVzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImFycmF5XCIsXG5cdFx0XHRcdFx0XHRpdGVtczoge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdF0sXG5cdH0sXG5cblx0ZGVmYXVsdE9wdGlvbnM6IFtcImVycm9yXCIsIDxJT3B0aW9ucz57XG5cdFx0XCJza2lwQ29tbWVudHNcIjogZmFsc2UsXG5cdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XCJza2lwUmVnRXhwc1wiOiBmYWxzZSxcblx0XHRpZ25vcmVzOiBbXSxcblx0fV0sXG5cblx0Y3JlYXRlKGNvbnRleHQ6IFJ1bGVDb250ZXh0PHN0cmluZywgSU9wdGlvbnNBcnJheT4pXG5cdHtcblxuXHRcdC8vIE1vZHVsZSBzdG9yZSBvZiBlcnJvcnMgdGhhdCB3ZSBoYXZlIGZvdW5kXG5cdFx0bGV0IGVycm9ycyA9IFtdO1xuXG5cdFx0Ly8gTG9va3VwIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24sIHdoaWNoIGRlZmF1bHRzIHRvIGBmYWxzZWAuXG5cdFx0Y29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcblx0XHRjb25zdCBza2lwQ29tbWVudHMgPSAhIW9wdGlvbnMuc2tpcENvbW1lbnRzO1xuXHRcdGNvbnN0IHNraXBTdHJpbmdzID0gb3B0aW9ucy5za2lwU3RyaW5ncyAhPT0gZmFsc2U7XG5cdFx0Y29uc3Qgc2tpcFJlZ0V4cHMgPSAhIW9wdGlvbnMuc2tpcFJlZ0V4cHM7XG5cdFx0Y29uc3Qgc2tpcFRlbXBsYXRlcyA9ICEhb3B0aW9ucy5za2lwVGVtcGxhdGVzO1xuXHRcdGNvbnN0IGlnbm9yZXMgPSBvcHRpb25zLmlnbm9yZXMgfHwgW107XG5cdFx0Y29uc3QgaWdub3Jlc1JlOiBSZWdFeHAgPSBpZ25vcmVzLmxlbmd0aCAmJiBuZXcgUmVnRXhwKGlnbm9yZXMubWFwKGMgPT4gYCR7Yy5jb2RlUG9pbnRBdCgwKS50b1N0cmluZygxNil9YCkuam9pbihcInxcIiksIFwiZ3VcIik7XG5cblx0XHRjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XG5cdFx0Y29uc3QgY29tbWVudE5vZGVzID0gc291cmNlQ29kZS5nZXRBbGxDb21tZW50cygpO1xuXG5cdFx0LyoqXG5cdFx0ICogcmVtb3ZlIHJlZ2V4cCBpbiBpZ25vcmVzXG5cdFx0ICogQHBhcmFtIHtSZWdFeHB9IHJlIGlucHV0IHJlZ2V4cFxuXHRcdCAqIEByZXR1cm5zIHtSZWdFeHB9IG5ldyByZWdleHBcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZVJlZ2V4Q2xhc3MocmU6IFJlZ0V4cClcblx0XHR7XG5cdFx0XHRpZiAoIWlnbm9yZXMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cChyZS5zb3VyY2UucmVwbGFjZShpZ25vcmVzUmUsIFwiXCIpLCByZS5mbGFncyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgQUxMX0lSUkVHVUxBUlNfTE9DQUwgPSByZW1vdmVSZWdleENsYXNzKEFMTF9JUlJFR1VMQVJTKTtcblx0XHRjb25zdCBJUlJFR1VMQVJfV0hJVEVTUEFDRV9MT0NBTCA9IHJlbW92ZVJlZ2V4Q2xhc3MoSVJSRUdVTEFSX1dISVRFU1BBQ0UpO1xuXG5cdFx0LyoqXG5cdFx0ICogUmVtb3ZlcyBlcnJvcnMgdGhhdCBvY2N1ciBpbnNpZGUgYSBzdHJpbmcgbm9kZVxuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGU6IFRTRVNUcmVlLkJhc2VOb2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IGxvY1N0YXJ0ID0gbm9kZS5sb2Muc3RhcnQ7XG5cdFx0XHRjb25zdCBsb2NFbmQgPSBub2RlLmxvYy5lbmQ7XG5cblx0XHRcdGVycm9ycyA9IGVycm9ycy5maWx0ZXIoKHsgbG9jOiBlcnJvckxvYyB9KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZXJyb3JMb2MubGluZSA+PSBsb2NTdGFydC5saW5lICYmIGVycm9yTG9jLmxpbmUgPD0gbG9jRW5kLmxpbmUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoZXJyb3JMb2MuY29sdW1uID49IGxvY1N0YXJ0LmNvbHVtbiAmJiAoZXJyb3JMb2MuY29sdW1uIDw9IGxvY0VuZC5jb2x1bW4gfHwgZXJyb3JMb2MubGluZSA8IGxvY0VuZC5saW5lKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIGlkZW50aWZpZXIgb3IgbGl0ZXJhbCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5JZGVudGlmaWVyT3JMaXRlcmFsKG5vZGU6IFRTRVNUcmVlLkxpdGVyYWwpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc2hvdWxkQ2hlY2tTdHJpbmdzID0gc2tpcFN0cmluZ3MgJiYgKHR5cGVvZiBub2RlLnZhbHVlID09PSBcInN0cmluZ1wiKTtcblx0XHRcdGNvbnN0IHNob3VsZENoZWNrUmVnRXhwcyA9IHNraXBSZWdFeHBzICYmIEJvb2xlYW4obm9kZS5yZWdleCk7XG5cblx0XHRcdGlmIChzaG91bGRDaGVja1N0cmluZ3MgfHwgc2hvdWxkQ2hlY2tSZWdFeHBzKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgaXJyZWd1bGFyIGNoYXJhY3RlcnMgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgZXJyb3JzIGxpc3Rcblx0XHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS5yYXcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRlbXBsYXRlIHN0cmluZyBsaXRlcmFsIG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJblRlbXBsYXRlTGl0ZXJhbChub2RlOiBUU0VTVHJlZS5UZW1wbGF0ZUVsZW1lbnQpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBub2RlLnZhbHVlLnJhdyA9PT0gXCJzdHJpbmdcIilcblx0XHRcdHtcblx0XHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS52YWx1ZS5yYXcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIGNvbW1lbnQgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luQ29tbWVudChub2RlOiBUU0VTVHJlZS5Db21tZW50KVxuXHRcdHtcblx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUudmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRoZSBwcm9ncmFtIHNvdXJjZSBmb3IgaXJyZWd1bGFyIHdoaXRlc3BhY2Vcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgVGhlIHByb2dyYW0gbm9kZVxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGU6IFRTRVNUcmVlLk5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc291cmNlTGluZXMgPSBzb3VyY2VDb2RlLmxpbmVzO1xuXG5cdFx0XHRzb3VyY2VMaW5lcy5mb3JFYWNoKChzb3VyY2VMaW5lLCBsaW5lSW5kZXgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxpbmVOdW1iZXIgPSBsaW5lSW5kZXggKyAxO1xuXHRcdFx0XHRsZXQgbWF0Y2g7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaCA9IElSUkVHVUxBUl9XSElURVNQQUNFX0xPQ0FMLmV4ZWMoc291cmNlTGluZSkpICE9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSB7XG5cdFx0XHRcdFx0XHRsaW5lOiBsaW5lTnVtYmVyLFxuXHRcdFx0XHRcdFx0Y29sdW1uOiBtYXRjaC5pbmRleCxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZXJyb3JzLnB1c2goeyBub2RlLCBtZXNzYWdlOiBcIklycmVndWxhciB3aGl0ZXNwYWNlIG5vdCBhbGxvd2VkLlwiLCBsb2M6IGxvY2F0aW9uIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGhlIHByb2dyYW0gc291cmNlIGZvciBpcnJlZ3VsYXIgbGluZSB0ZXJtaW5hdG9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSBUaGUgcHJvZ3JhbSBub2RlXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlOiBUU0VTVHJlZS5Ob2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNvdXJjZSA9IHNvdXJjZUNvZGUuZ2V0VGV4dCgpLFxuXHRcdFx0XHRzb3VyY2VMaW5lcyA9IHNvdXJjZUNvZGUubGluZXMsXG5cdFx0XHRcdGxpbmVicmVha3MgPSBzb3VyY2UubWF0Y2goTElORV9CUkVBSyk7XG5cdFx0XHRsZXQgbGFzdExpbmVJbmRleCA9IC0xLFxuXHRcdFx0XHRtYXRjaDtcblxuXHRcdFx0d2hpbGUgKChtYXRjaCA9IElSUkVHVUxBUl9MSU5FX1RFUk1JTkFUT1JTLmV4ZWMoc291cmNlKSkgIT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGxpbmVJbmRleCA9IGxpbmVicmVha3MuaW5kZXhPZihtYXRjaFswXSwgbGFzdExpbmVJbmRleCArIDEpIHx8IDA7XG5cdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0ge1xuXHRcdFx0XHRcdGxpbmU6IGxpbmVJbmRleCArIDEsXG5cdFx0XHRcdFx0Y29sdW1uOiBzb3VyY2VMaW5lc1tsaW5lSW5kZXhdLmxlbmd0aCxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRlcnJvcnMucHVzaCh7IG5vZGUsIG1lc3NhZ2U6IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCIsIGxvYzogbG9jYXRpb24gfSk7XG5cdFx0XHRcdGxhc3RMaW5lSW5kZXggPSBsaW5lSW5kZXg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQSBuby1vcCBmdW5jdGlvbiB0byBhY3QgYXMgcGxhY2Vob2xkZXIgZm9yIGNvbW1lbnQgYWNjdW11bGF0aW9uIHdoZW4gdGhlIGBza2lwQ29tbWVudHNgIG9wdGlvbiBpcyBgZmFsc2VgLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbm9vcCgpXG5cdFx0e31cblxuXHRcdGNvbnN0IG5vZGVzOiB7XG5cdFx0XHQvL1trIGluIEFTVF9OT0RFX1RZUEVTXT86IChub2RlPzogVFNFU1RyZWUuTm9kZSkgPT4gdm9pZFxuXHRcdH0gJiB7XG5cblx0XHRcdFwiUHJvZ3JhbTpleGl0XCI/OiAoKSA9PiB2b2lkO1xuXG5cdFx0XHRQcm9ncmFtPyhub2RlOiBUU0VTVHJlZS5Qcm9ncmFtKTogdm9pZDtcblx0XHRcdElkZW50aWZpZXI/KG5vZGU6IFRTRVNUcmVlLkxpdGVyYWwpOiB2b2lkO1xuXHRcdFx0TGl0ZXJhbD8obm9kZTogVFNFU1RyZWUuTGl0ZXJhbCk6IHZvaWQ7XG5cdFx0XHRUZW1wbGF0ZUVsZW1lbnQ/KG5vZGU6IFRTRVNUcmVlLlRlbXBsYXRlRWxlbWVudCk6IHZvaWQ7XG5cblx0XHR9ID0ge307XG5cblx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChzb3VyY2VDb2RlLmdldFRleHQoKSkpXG5cdFx0e1xuXHRcdFx0bm9kZXMuUHJvZ3JhbSA9IGZ1bmN0aW9uIChub2RlKVxuXHRcdFx0e1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIEFzIHdlIGNhbiBlYXNpbHkgZmlyZSB3YXJuaW5ncyBmb3IgYWxsIHdoaXRlIHNwYWNlIGlzc3VlcyB3aXRoXG5cdFx0XHRcdCAqIGFsbCB0aGUgc291cmNlIGl0cyBzaW1wbGVyIHRvIGZpcmUgdGhlbSBoZXJlLlxuXHRcdFx0XHQgKiBUaGlzIG1lYW5zIHdlIGNhbiBjaGVjayBhbGwgdGhlIGFwcGxpY2F0aW9uIGNvZGUgd2l0aG91dCBoYXZpbmdcblx0XHRcdFx0ICogdG8gd29ycnkgYWJvdXQgaXNzdWVzIGNhdXNlZCBpbiB0aGUgcGFyc2VyIHRva2Vucy5cblx0XHRcdFx0ICogV2hlbiB3cml0aW5nIHRoaXMgY29kZSBhbHNvIGV2YWx1YXRpbmcgcGVyIG5vZGUgd2FzIG1pc3Npbmcgb3V0XG5cdFx0XHRcdCAqIGNvbm5lY3RpbmcgdG9rZW5zIGluIHNvbWUgY2FzZXMuXG5cdFx0XHRcdCAqIFdlIGNhbiBsYXRlciBmaWx0ZXIgdGhlIGVycm9ycyB3aGVuIHRoZXkgYXJlIGZvdW5kIHRvIGJlIG5vdCBhblxuXHRcdFx0XHQgKiBpc3N1ZSBpbiBub2RlcyB3ZSBkb24ndCBjYXJlIGFib3V0LlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y2hlY2tGb3JJcnJlZ3VsYXJXaGl0ZXNwYWNlKG5vZGUpO1xuXHRcdFx0XHRjaGVja0ZvcklycmVndWxhckxpbmVUZXJtaW5hdG9ycyhub2RlKTtcblx0XHRcdH07XG5cblx0XHRcdG5vZGVzLklkZW50aWZpZXIgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLkxpdGVyYWwgPSByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbDtcblx0XHRcdG5vZGVzLlRlbXBsYXRlRWxlbWVudCA9IHNraXBUZW1wbGF0ZXMgPyByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsIDogbm9vcDtcblx0XHRcdG5vZGVzW1wiUHJvZ3JhbTpleGl0XCJdID0gZnVuY3Rpb24gKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKHNraXBDb21tZW50cylcblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0Ly8gRmlyc3Qgc3RyaXAgZXJyb3JzIG9jY3VycmluZyBpbiBjb21tZW50IG5vZGVzLlxuXHRcdFx0XHRcdGNvbW1lbnROb2Rlcy5mb3JFYWNoKHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgYW55IGVycm9ycyByZW1haW5pbmcgcmVwb3J0IG9uIHRoZW1cblx0XHRcdFx0ZXJyb3JzLmZvckVhY2goZXJyb3IgPT4gY29udGV4dC5yZXBvcnQoZXJyb3IpKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRub2Rlcy5Qcm9ncmFtID0gbm9vcDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbm9kZXM7XG5cdH0sXG59IGFzIGNvbnN0O1xuIl19