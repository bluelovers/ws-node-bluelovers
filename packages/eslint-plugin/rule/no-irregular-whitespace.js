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
    defaultOptions: {
        skipComments: true,
        ignores: ['\u3000'],
    },
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
        const ignoresRe = new RegExp(ignores.map(c => `${c.codePointAt(0).toString(16)}`).join("|"), "gu");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQVliLE1BQU0sY0FBYyxHQUFHLDZJQUE2SSxDQUFDO0FBQ3JLLE1BQU0sb0JBQW9CLEdBQUcsb0lBQW9JLENBQUM7QUFDbEssTUFBTSwwQkFBMEIsR0FBRyxtQkFBbUIsQ0FBQztBQUN2RCxNQUFNLFVBQVUsR0FBRywyQkFBMkIsQ0FBQztBQWlCL0Msa0JBQWU7SUFDZCxJQUFJLEVBQUU7UUFDTCxJQUFJLEVBQUUsU0FBUztRQUVmLElBQUksRUFBRTtZQUNMLFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsUUFBUSxFQUFFLGlCQUFpQjtZQUMzQixXQUFXLEVBQUUsSUFBSTtZQUNqQixHQUFHLEVBQUUsdURBQXVEO1NBQzVEO1FBRUQsTUFBTSxFQUFFO1lBQ1A7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNYLFlBQVksRUFBRTt3QkFDYixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxXQUFXLEVBQUU7d0JBQ1osSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLElBQUk7cUJBQ2I7b0JBQ0QsYUFBYSxFQUFFO3dCQUNkLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSztxQkFDZDtvQkFDRCxPQUFPLEVBQUU7d0JBQ1IsSUFBSSxFQUFFLE9BQU87d0JBQ2IsS0FBSyxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFRO3lCQUNkO3FCQUNEO2lCQUNEO2dCQUNELG9CQUFvQixFQUFFLEtBQUs7YUFDM0I7U0FDRDtLQUNEO0lBRUQs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LEVBQ25EO1lBQ0MsS0FBSyxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUk7Z0JBRzdCOzs7Ozs7Ozs7bUJBU0c7Z0JBQ0gsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQztZQUVGLEtBQUssQ0FBQyxVQUFVLEdBQUcsNENBQTRDLENBQUM7WUFDaEUsS0FBSyxDQUFDLE9BQU8sR0FBRyw0Q0FBNEMsQ0FBQztZQUM3RCxLQUFLLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4RixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUc7Z0JBRXZCLElBQUksWUFBWSxFQUNoQjtvQkFFQyxpREFBaUQ7b0JBQ2pELFlBQVksQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztpQkFDdkQ7Z0JBRUQsaURBQWlEO2dCQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztTQUNGO2FBRUQ7WUFDQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztDQUNRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBkaXNhbG93IHdoaXRlc3BhY2UgdGhhdCBpcyBub3QgYSB0YWIgb3Igc3BhY2UsIHdoaXRlc3BhY2UgaW5zaWRlIHN0cmluZ3MgYW5kIGNvbW1lbnRzIGFyZSBhbGxvd2VkXG4gKiBAYXV0aG9yIEpvbmF0aGFuIEtpbmdzdG9uXG4gKiBAYXV0aG9yIENocmlzdG9waGUgUG9ydGVuZXV2ZVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge1xuXHRBU1RfTk9ERV9UWVBFUyxcblx0QVNUX1RPS0VOX1RZUEVTLFxuXHRUU0VTVHJlZSxcblx0RVNMaW50VXRpbHMsXG5cdFRTRVNMaW50LFxufSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwZXJpbWVudGFsLXV0aWxzJztcbmltcG9ydCB7IExpdGVyYWwgfSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvdHlwZXNjcmlwdC1lc3RyZWUvZGlzdC90cy1lc3RyZWUvdHMtZXN0cmVlJztcbmltcG9ydCB7IFJ1bGVNb2R1bGUsIFJ1bGVNZXRhRGF0YSwgUnVsZUNvbnRleHQgfSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwZXJpbWVudGFsLXV0aWxzL2Rpc3QvdHMtZXNsaW50JztcblxuY29uc3QgQUxMX0lSUkVHVUxBUlMgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldL3U7XG5jb25zdCBJUlJFR1VMQVJfV0hJVEVTUEFDRSA9IC9bXFxmXFx2XFx1MDA4NVxcdWZlZmZcXHUwMGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMGJcXHUyMDJmXFx1MjA1ZlxcdTMwMDBdKy9tZ3U7XG5jb25zdCBJUlJFR1VMQVJfTElORV9URVJNSU5BVE9SUyA9IC9bXFx1MjAyOFxcdTIwMjldL21ndTtcbmNvbnN0IExJTkVfQlJFQUsgPSAvXFxyXFxufFtcXHJcXG5cXHUyMDI4XFx1MjAyOV0vZ3U7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNcbntcblx0c2tpcENvbW1lbnRzPzogYm9vbGVhbixcblx0c2tpcFN0cmluZ3M/OiBib29sZWFuLFxuXHRza2lwUmVnRXhwcz86IGJvb2xlYW4sXG5cdHNraXBUZW1wbGF0ZXM/OiBib29sZWFuLFxuXHRpZ25vcmVzPzogc3RyaW5nW10sXG59XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zQXJyYXkgPSBbSU9wdGlvbnNdO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdG1ldGE6IHtcblx0XHR0eXBlOiBcInByb2JsZW1cIixcblxuXHRcdGRvY3M6IHtcblx0XHRcdGRlc2NyaXB0aW9uOiBcImRpc2FsbG93IGlycmVndWxhciB3aGl0ZXNwYWNlXCIsXG5cdFx0XHRjYXRlZ29yeTogXCJQb3NzaWJsZSBFcnJvcnNcIixcblx0XHRcdHJlY29tbWVuZGVkOiB0cnVlLFxuXHRcdFx0dXJsOiBcImh0dHBzOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLWlycmVndWxhci13aGl0ZXNwYWNlXCIsXG5cdFx0fSxcblxuXHRcdHNjaGVtYTogW1xuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0c2tpcENvbW1lbnRzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFN0cmluZ3M6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBUZW1wbGF0ZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwUmVnRXhwczoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGlnbm9yZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYXJyYXlcIixcblx0XHRcdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblxuXHRkZWZhdWx0T3B0aW9uczogPElPcHRpb25zPntcblx0XHRza2lwQ29tbWVudHM6IHRydWUsXG5cdFx0aWdub3JlczogWydcXHUzMDAwJ10sXG5cdH0sXG5cblx0Y3JlYXRlKGNvbnRleHQ6IFJ1bGVDb250ZXh0PHN0cmluZywgSU9wdGlvbnNBcnJheT4pXG5cdHtcblxuXHRcdC8vIE1vZHVsZSBzdG9yZSBvZiBlcnJvcnMgdGhhdCB3ZSBoYXZlIGZvdW5kXG5cdFx0bGV0IGVycm9ycyA9IFtdO1xuXG5cdFx0Ly8gTG9va3VwIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24sIHdoaWNoIGRlZmF1bHRzIHRvIGBmYWxzZWAuXG5cdFx0Y29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcblx0XHRjb25zdCBza2lwQ29tbWVudHMgPSAhIW9wdGlvbnMuc2tpcENvbW1lbnRzO1xuXHRcdGNvbnN0IHNraXBTdHJpbmdzID0gb3B0aW9ucy5za2lwU3RyaW5ncyAhPT0gZmFsc2U7XG5cdFx0Y29uc3Qgc2tpcFJlZ0V4cHMgPSAhIW9wdGlvbnMuc2tpcFJlZ0V4cHM7XG5cdFx0Y29uc3Qgc2tpcFRlbXBsYXRlcyA9ICEhb3B0aW9ucy5za2lwVGVtcGxhdGVzO1xuXHRcdGNvbnN0IGlnbm9yZXMgPSBvcHRpb25zLmlnbm9yZXMgfHwgW107XG5cdFx0Y29uc3QgaWdub3Jlc1JlID0gbmV3IFJlZ0V4cChpZ25vcmVzLm1hcChjID0+IGAke2MuY29kZVBvaW50QXQoMCkudG9TdHJpbmcoMTYpfWApLmpvaW4oXCJ8XCIpLCBcImd1XCIpO1xuXG5cdFx0Y29uc3Qgc291cmNlQ29kZSA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpO1xuXHRcdGNvbnN0IGNvbW1lbnROb2RlcyA9IHNvdXJjZUNvZGUuZ2V0QWxsQ29tbWVudHMoKTtcblxuXHRcdC8qKlxuXHRcdCAqIHJlbW92ZSByZWdleHAgaW4gaWdub3Jlc1xuXHRcdCAqIEBwYXJhbSB7UmVnRXhwfSByZSBpbnB1dCByZWdleHBcblx0XHQgKiBAcmV0dXJucyB7UmVnRXhwfSBuZXcgcmVnZXhwXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVSZWdleENsYXNzKHJlOiBSZWdFeHApXG5cdFx0e1xuXHRcdFx0aWYgKCFpZ25vcmVzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBSZWdFeHAocmUuc291cmNlLnJlcGxhY2UoaWdub3Jlc1JlLCBcIlwiKSwgcmUuZmxhZ3MpO1xuXHRcdH1cblxuXHRcdGNvbnN0IEFMTF9JUlJFR1VMQVJTX0xPQ0FMID0gcmVtb3ZlUmVnZXhDbGFzcyhBTExfSVJSRUdVTEFSUyk7XG5cdFx0Y29uc3QgSVJSRUdVTEFSX1dISVRFU1BBQ0VfTE9DQUwgPSByZW1vdmVSZWdleENsYXNzKElSUkVHVUxBUl9XSElURVNQQUNFKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZXMgZXJyb3JzIHRoYXQgb2NjdXIgaW5zaWRlIGEgc3RyaW5nIG5vZGVcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlOiBUU0VTVHJlZS5CYXNlTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBsb2NTdGFydCA9IG5vZGUubG9jLnN0YXJ0O1xuXHRcdFx0Y29uc3QgbG9jRW5kID0gbm9kZS5sb2MuZW5kO1xuXG5cdFx0XHRlcnJvcnMgPSBlcnJvcnMuZmlsdGVyKCh7IGxvYzogZXJyb3JMb2MgfSkgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKGVycm9yTG9jLmxpbmUgPj0gbG9jU3RhcnQubGluZSAmJiBlcnJvckxvYy5saW5lIDw9IGxvY0VuZC5saW5lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGVycm9yTG9jLmNvbHVtbiA+PSBsb2NTdGFydC5jb2x1bW4gJiYgKGVycm9yTG9jLmNvbHVtbiA8PSBsb2NFbmQuY29sdW1uIHx8IGVycm9yTG9jLmxpbmUgPCBsb2NFbmQubGluZSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyBpZGVudGlmaWVyIG9yIGxpdGVyYWwgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luSWRlbnRpZmllck9yTGl0ZXJhbChub2RlOiBUU0VTVHJlZS5MaXRlcmFsKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNob3VsZENoZWNrU3RyaW5ncyA9IHNraXBTdHJpbmdzICYmICh0eXBlb2Ygbm9kZS52YWx1ZSA9PT0gXCJzdHJpbmdcIik7XG5cdFx0XHRjb25zdCBzaG91bGRDaGVja1JlZ0V4cHMgPSBza2lwUmVnRXhwcyAmJiBCb29sZWFuKG5vZGUucmVnZXgpO1xuXG5cdFx0XHRpZiAoc2hvdWxkQ2hlY2tTdHJpbmdzIHx8IHNob3VsZENoZWNrUmVnRXhwcylcblx0XHRcdHtcblxuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGlycmVndWxhciBjaGFyYWN0ZXJzIHJlbW92ZSB0aGVtIGZyb20gdGhlIGVycm9ycyBsaXN0XG5cdFx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUucmF3KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0ZW1wbGF0ZSBzdHJpbmcgbGl0ZXJhbCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5UZW1wbGF0ZUxpdGVyYWwobm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2Ygbm9kZS52YWx1ZS5yYXcgPT09IFwic3RyaW5nXCIpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KG5vZGUudmFsdWUucmF3KSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyBjb21tZW50IG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbkNvbW1lbnQobm9kZTogVFNFU1RyZWUuQ29tbWVudClcblx0XHR7XG5cdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnZhbHVlKSlcblx0XHRcdHtcblx0XHRcdFx0cmVtb3ZlV2hpdGVzcGFjZUVycm9yKG5vZGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0aGUgcHJvZ3JhbSBzb3VyY2UgZm9yIGlycmVndWxhciB3aGl0ZXNwYWNlXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIFRoZSBwcm9ncmFtIG5vZGVcblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoZWNrRm9ySXJyZWd1bGFyV2hpdGVzcGFjZShub2RlOiBUU0VTVHJlZS5Ob2RlKVxuXHRcdHtcblx0XHRcdGNvbnN0IHNvdXJjZUxpbmVzID0gc291cmNlQ29kZS5saW5lcztcblxuXHRcdFx0c291cmNlTGluZXMuZm9yRWFjaCgoc291cmNlTGluZSwgbGluZUluZGV4KSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBsaW5lTnVtYmVyID0gbGluZUluZGV4ICsgMTtcblx0XHRcdFx0bGV0IG1hdGNoO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2ggPSBJUlJFR1VMQVJfV0hJVEVTUEFDRV9MT0NBTC5leGVjKHNvdXJjZUxpbmUpKSAhPT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnN0IGxvY2F0aW9uID0ge1xuXHRcdFx0XHRcdFx0bGluZTogbGluZU51bWJlcixcblx0XHRcdFx0XHRcdGNvbHVtbjogbWF0Y2guaW5kZXgsXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGVycm9ycy5wdXNoKHsgbm9kZSwgbWVzc2FnZTogXCJJcnJlZ3VsYXIgd2hpdGVzcGFjZSBub3QgYWxsb3dlZC5cIiwgbG9jOiBsb2NhdGlvbiB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2tzIHRoZSBwcm9ncmFtIHNvdXJjZSBmb3IgaXJyZWd1bGFyIGxpbmUgdGVybWluYXRvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgVGhlIHByb2dyYW0gbm9kZVxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gY2hlY2tGb3JJcnJlZ3VsYXJMaW5lVGVybWluYXRvcnMobm9kZTogVFNFU1RyZWUuTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBzb3VyY2UgPSBzb3VyY2VDb2RlLmdldFRleHQoKSxcblx0XHRcdFx0c291cmNlTGluZXMgPSBzb3VyY2VDb2RlLmxpbmVzLFxuXHRcdFx0XHRsaW5lYnJlYWtzID0gc291cmNlLm1hdGNoKExJTkVfQlJFQUspO1xuXHRcdFx0bGV0IGxhc3RMaW5lSW5kZXggPSAtMSxcblx0XHRcdFx0bWF0Y2g7XG5cblx0XHRcdHdoaWxlICgobWF0Y2ggPSBJUlJFR1VMQVJfTElORV9URVJNSU5BVE9SUy5leGVjKHNvdXJjZSkpICE9PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBsaW5lSW5kZXggPSBsaW5lYnJlYWtzLmluZGV4T2YobWF0Y2hbMF0sIGxhc3RMaW5lSW5kZXggKyAxKSB8fCAwO1xuXHRcdFx0XHRjb25zdCBsb2NhdGlvbiA9IHtcblx0XHRcdFx0XHRsaW5lOiBsaW5lSW5kZXggKyAxLFxuXHRcdFx0XHRcdGNvbHVtbjogc291cmNlTGluZXNbbGluZUluZGV4XS5sZW5ndGgsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0ZXJyb3JzLnB1c2goeyBub2RlLCBtZXNzYWdlOiBcIklycmVndWxhciB3aGl0ZXNwYWNlIG5vdCBhbGxvd2VkLlwiLCBsb2M6IGxvY2F0aW9uIH0pO1xuXHRcdFx0XHRsYXN0TGluZUluZGV4ID0gbGluZUluZGV4O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEEgbm8tb3AgZnVuY3Rpb24gdG8gYWN0IGFzIHBsYWNlaG9sZGVyIGZvciBjb21tZW50IGFjY3VtdWxhdGlvbiB3aGVuIHRoZSBgc2tpcENvbW1lbnRzYCBvcHRpb24gaXMgYGZhbHNlYC5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5vb3AoKVxuXHRcdHt9XG5cblx0XHRjb25zdCBub2Rlczoge1xuXHRcdFx0Ly9bayBpbiBBU1RfTk9ERV9UWVBFU10/OiAobm9kZT86IFRTRVNUcmVlLk5vZGUpID0+IHZvaWRcblx0XHR9ICYge1xuXG5cdFx0XHRcIlByb2dyYW06ZXhpdFwiPzogKCkgPT4gdm9pZDtcblxuXHRcdFx0UHJvZ3JhbT8obm9kZTogVFNFU1RyZWUuUHJvZ3JhbSk6IHZvaWQ7XG5cdFx0XHRJZGVudGlmaWVyPyhub2RlOiBUU0VTVHJlZS5MaXRlcmFsKTogdm9pZDtcblx0XHRcdExpdGVyYWw/KG5vZGU6IFRTRVNUcmVlLkxpdGVyYWwpOiB2b2lkO1xuXHRcdFx0VGVtcGxhdGVFbGVtZW50Pyhub2RlOiBUU0VTVHJlZS5UZW1wbGF0ZUVsZW1lbnQpOiB2b2lkO1xuXG5cdFx0fSA9IHt9O1xuXG5cdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qoc291cmNlQ29kZS5nZXRUZXh0KCkpKVxuXHRcdHtcblx0XHRcdG5vZGVzLlByb2dyYW0gPSBmdW5jdGlvbiAobm9kZSlcblx0XHRcdHtcblxuXHRcdFx0XHQvKlxuXHRcdFx0XHQgKiBBcyB3ZSBjYW4gZWFzaWx5IGZpcmUgd2FybmluZ3MgZm9yIGFsbCB3aGl0ZSBzcGFjZSBpc3N1ZXMgd2l0aFxuXHRcdFx0XHQgKiBhbGwgdGhlIHNvdXJjZSBpdHMgc2ltcGxlciB0byBmaXJlIHRoZW0gaGVyZS5cblx0XHRcdFx0ICogVGhpcyBtZWFucyB3ZSBjYW4gY2hlY2sgYWxsIHRoZSBhcHBsaWNhdGlvbiBjb2RlIHdpdGhvdXQgaGF2aW5nXG5cdFx0XHRcdCAqIHRvIHdvcnJ5IGFib3V0IGlzc3VlcyBjYXVzZWQgaW4gdGhlIHBhcnNlciB0b2tlbnMuXG5cdFx0XHRcdCAqIFdoZW4gd3JpdGluZyB0aGlzIGNvZGUgYWxzbyBldmFsdWF0aW5nIHBlciBub2RlIHdhcyBtaXNzaW5nIG91dFxuXHRcdFx0XHQgKiBjb25uZWN0aW5nIHRva2VucyBpbiBzb21lIGNhc2VzLlxuXHRcdFx0XHQgKiBXZSBjYW4gbGF0ZXIgZmlsdGVyIHRoZSBlcnJvcnMgd2hlbiB0aGV5IGFyZSBmb3VuZCB0byBiZSBub3QgYW5cblx0XHRcdFx0ICogaXNzdWUgaW4gbm9kZXMgd2UgZG9uJ3QgY2FyZSBhYm91dC5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGNoZWNrRm9ySXJyZWd1bGFyV2hpdGVzcGFjZShub2RlKTtcblx0XHRcdFx0Y2hlY2tGb3JJcnJlZ3VsYXJMaW5lVGVybWluYXRvcnMobm9kZSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRub2Rlcy5JZGVudGlmaWVyID0gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbklkZW50aWZpZXJPckxpdGVyYWw7XG5cdFx0XHRub2Rlcy5MaXRlcmFsID0gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbklkZW50aWZpZXJPckxpdGVyYWw7XG5cdFx0XHRub2Rlcy5UZW1wbGF0ZUVsZW1lbnQgPSBza2lwVGVtcGxhdGVzID8gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJblRlbXBsYXRlTGl0ZXJhbCA6IG5vb3A7XG5cdFx0XHRub2Rlc1tcIlByb2dyYW06ZXhpdFwiXSA9IGZ1bmN0aW9uICgpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChza2lwQ29tbWVudHMpXG5cdFx0XHRcdHtcblxuXHRcdFx0XHRcdC8vIEZpcnN0IHN0cmlwIGVycm9ycyBvY2N1cnJpbmcgaW4gY29tbWVudCBub2Rlcy5cblx0XHRcdFx0XHRjb21tZW50Tm9kZXMuZm9yRWFjaChyZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luQ29tbWVudCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGFueSBlcnJvcnMgcmVtYWluaW5nIHJlcG9ydCBvbiB0aGVtXG5cdFx0XHRcdGVycm9ycy5mb3JFYWNoKGVycm9yID0+IGNvbnRleHQucmVwb3J0KGVycm9yKSk7XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bm9kZXMuUHJvZ3JhbSA9IG5vb3A7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5vZGVzO1xuXHR9LFxufSBhcyBjb25zdDtcbiJdfQ==