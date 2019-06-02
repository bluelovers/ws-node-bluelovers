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
        const sourceCode = context.getSourceCode();
        const commentNodes = sourceCode.getAllComments();
        function handleIgnoreRe(ignores) {
            if (!ignores || !ignores.length) {
                return null;
            }
            let source = ignores
                .map(c => {
                if (c === '\f' || c === '\\f' || c === '\\\\f') {
                    return '\\\\f';
                }
                else if (c === '\v' || c === '\\v' || c === '\\\\v') {
                    return '\\\\v';
                }
                else if (c.startsWith('\\\\u')) {
                    return c;
                }
                else if (c.length === 1) {
                    return `\\\\u${c.codePointAt(0).toString(16)}`;
                }
                else if (c.startsWith('\\\\')) {
                    return c;
                }
                throw new TypeError(`${c} \\u${c.codePointAt(0).toString(16)}`);
            })
                .join("|");
            return new RegExp(source, 'ug');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8taXJyZWd1bGFyLXdoaXRlc3BhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQVliLE1BQU0sY0FBYyxHQUFHLDZJQUE2SSxDQUFDO0FBQ3JLLE1BQU0sb0JBQW9CLEdBQUcsb0lBQW9JLENBQUM7QUFDbEssTUFBTSwwQkFBMEIsR0FBRyxtQkFBbUIsQ0FBQztBQUN2RCxNQUFNLFVBQVUsR0FBRywyQkFBMkIsQ0FBQztBQWlCL0Msa0JBQWU7SUFFZCxJQUFJLEVBQUUseUJBQXlCO0lBRS9CLElBQUksRUFBRTtRQUNMLElBQUksRUFBRSxTQUFTO1FBRWYsSUFBSSxFQUFFO1lBQ0wsV0FBVyxFQUFFLCtCQUErQjtZQUM1QyxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLEdBQUcsRUFBRSx1REFBdUQ7U0FDNUQ7UUFFRCxNQUFNLEVBQUU7WUFDUDtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1gsWUFBWSxFQUFFO3dCQUNiLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELFdBQVcsRUFBRTt3QkFDWixJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsSUFBSTtxQkFDYjtvQkFDRCxhQUFhLEVBQUU7d0JBQ2QsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsT0FBTyxFQUFFLEtBQUs7cUJBQ2Q7b0JBQ0QsV0FBVyxFQUFFO3dCQUNaLElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3FCQUNkO29CQUNELE9BQU8sRUFBRTt3QkFDUixJQUFJLEVBQUUsT0FBTzt3QkFDYixLQUFLLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7eUJBQ2Q7cUJBQ0Q7aUJBQ0Q7Z0JBQ0Qsb0JBQW9CLEVBQUUsS0FB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QUFnQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQztZQUVGLEtBQUssQ0FBQyxVQUFVLEdBQUcsNENBQTRDLENBQUM7WUFDaEUsS0FBSyxDQUFDLE9BQU8sR0FBRyw0Q0FBNEMsQ0FBQztZQUM3RCxLQUFLLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4RixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUc7Z0JBRXZCLElBQUksWUFBWSxFQUNoQjtvQkFFQyxpREFBaUQ7b0JBQ2pELFlBQVksQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztpQkFDdkQ7Z0JBRUQsaURBQWlEO2dCQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztTQUNGO2FBRUQ7WUFDQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztDQUNRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBkaXNhbG93IHdoaXRlc3BhY2UgdGhhdCBpcyBub3QgYSB0YWIgb3Igc3BhY2UsIHdoaXRlc3BhY2UgaW5zaWRlIHN0cmluZ3MgYW5kIGNvbW1lbnRzIGFyZSBhbGxvd2VkXG4gKiBAYXV0aG9yIEpvbmF0aGFuIEtpbmdzdG9uXG4gKiBAYXV0aG9yIENocmlzdG9waGUgUG9ydGVuZXV2ZVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQge1xuXHRBU1RfTk9ERV9UWVBFUyxcblx0QVNUX1RPS0VOX1RZUEVTLFxuXHRUU0VTVHJlZSxcblx0RVNMaW50VXRpbHMsXG5cdFRTRVNMaW50LFxufSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwZXJpbWVudGFsLXV0aWxzJztcbmltcG9ydCB7IExpdGVyYWwgfSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvdHlwZXNjcmlwdC1lc3RyZWUvZGlzdC90cy1lc3RyZWUvdHMtZXN0cmVlJztcbmltcG9ydCB7IFJ1bGVNb2R1bGUsIFJ1bGVNZXRhRGF0YSwgUnVsZUNvbnRleHQgfSBmcm9tICdAdHlwZXNjcmlwdC1lc2xpbnQvZXhwZXJpbWVudGFsLXV0aWxzL2Rpc3QvdHMtZXNsaW50JztcblxuY29uc3QgQUxMX0lSUkVHVUxBUlMgPSAvW1xcZlxcdlxcdTAwODVcXHVmZWZmXFx1MDBhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDBiXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldL3U7XG5jb25zdCBJUlJFR1VMQVJfV0hJVEVTUEFDRSA9IC9bXFxmXFx2XFx1MDA4NVxcdWZlZmZcXHUwMGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMGJcXHUyMDJmXFx1MjA1ZlxcdTMwMDBdKy9tZ3U7XG5jb25zdCBJUlJFR1VMQVJfTElORV9URVJNSU5BVE9SUyA9IC9bXFx1MjAyOFxcdTIwMjldL21ndTtcbmNvbnN0IExJTkVfQlJFQUsgPSAvXFxyXFxufFtcXHJcXG5cXHUyMDI4XFx1MjAyOV0vZ3U7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNcbntcblx0c2tpcENvbW1lbnRzPzogYm9vbGVhbixcblx0c2tpcFN0cmluZ3M/OiBib29sZWFuLFxuXHRza2lwUmVnRXhwcz86IGJvb2xlYW4sXG5cdHNraXBUZW1wbGF0ZXM/OiBib29sZWFuLFxuXHRpZ25vcmVzPzogc3RyaW5nW10sXG59XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zQXJyYXkgPSBbSU9wdGlvbnNdO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cblx0bmFtZTogXCJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiLFxuXG5cdG1ldGE6IHtcblx0XHR0eXBlOiBcInByb2JsZW1cIixcblxuXHRcdGRvY3M6IHtcblx0XHRcdGRlc2NyaXB0aW9uOiBcImRpc2FsbG93IGlycmVndWxhciB3aGl0ZXNwYWNlXCIsXG5cdFx0XHRjYXRlZ29yeTogXCJQb3NzaWJsZSBFcnJvcnNcIixcblx0XHRcdHJlY29tbWVuZGVkOiB0cnVlLFxuXHRcdFx0dXJsOiBcImh0dHBzOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzL25vLWlycmVndWxhci13aGl0ZXNwYWNlXCIsXG5cdFx0fSxcblxuXHRcdHNjaGVtYTogW1xuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0c2tpcENvbW1lbnRzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHQ6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c2tpcFN0cmluZ3M6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHNraXBUZW1wbGF0ZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdDogZmFsc2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRza2lwUmVnRXhwczoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0OiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGlnbm9yZXM6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYXJyYXlcIixcblx0XHRcdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcblx0XHRcdH0sXG5cdFx0XSxcblx0fSxcblxuXHRkZWZhdWx0T3B0aW9uczogW1wiZXJyb3JcIiwgPElPcHRpb25zPntcblx0XHRcInNraXBDb21tZW50c1wiOiBmYWxzZSxcblx0XHRcInNraXBTdHJpbmdzXCI6IGZhbHNlLFxuXHRcdFwic2tpcFRlbXBsYXRlc1wiOiBmYWxzZSxcblx0XHRcInNraXBSZWdFeHBzXCI6IGZhbHNlLFxuXHRcdGlnbm9yZXM6IFtdLFxuXHR9XSxcblxuXHRjcmVhdGUoY29udGV4dDogUnVsZUNvbnRleHQ8c3RyaW5nLCBJT3B0aW9uc0FycmF5Pilcblx0e1xuXG5cdFx0Ly8gTW9kdWxlIHN0b3JlIG9mIGVycm9ycyB0aGF0IHdlIGhhdmUgZm91bmRcblx0XHRsZXQgZXJyb3JzID0gW107XG5cblx0XHQvLyBMb29rdXAgdGhlIGBza2lwQ29tbWVudHNgIG9wdGlvbiwgd2hpY2ggZGVmYXVsdHMgdG8gYGZhbHNlYC5cblx0XHRjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xuXHRcdGNvbnN0IHNraXBDb21tZW50cyA9ICEhb3B0aW9ucy5za2lwQ29tbWVudHM7XG5cdFx0Y29uc3Qgc2tpcFN0cmluZ3MgPSBvcHRpb25zLnNraXBTdHJpbmdzICE9PSBmYWxzZTtcblx0XHRjb25zdCBza2lwUmVnRXhwcyA9ICEhb3B0aW9ucy5za2lwUmVnRXhwcztcblx0XHRjb25zdCBza2lwVGVtcGxhdGVzID0gISFvcHRpb25zLnNraXBUZW1wbGF0ZXM7XG5cblx0XHRjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XG5cdFx0Y29uc3QgY29tbWVudE5vZGVzID0gc291cmNlQ29kZS5nZXRBbGxDb21tZW50cygpO1xuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlSWdub3JlUmUoaWdub3Jlczogc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0aWYgKCFpZ25vcmVzIHx8ICFpZ25vcmVzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBzb3VyY2UgPSBpZ25vcmVzXG5cdFx0XHRcdC5tYXAoYyA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGMgPT09ICdcXGYnIHx8IGMgPT09ICdcXFxcZicgfHwgYyA9PT0gJ1xcXFxcXFxcZicpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuICdcXFxcXFxcXGYnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmIChjID09PSAnXFx2JyB8fCBjID09PSAnXFxcXHYnIHx8IGMgPT09ICdcXFxcXFxcXHYnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAnXFxcXFxcXFx2Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5zdGFydHNXaXRoKCdcXFxcXFxcXHUnKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5sZW5ndGggPT09IDEpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGBcXFxcXFxcXHUke2MuY29kZVBvaW50QXQoMCkudG9TdHJpbmcoMTYpfWBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoYy5zdGFydHNXaXRoKCdcXFxcXFxcXCcpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjfSBcXFxcdSR7Yy5jb2RlUG9pbnRBdCgwKS50b1N0cmluZygxNil9YClcblx0XHRcdFx0fSlcblx0XHRcdFx0LmpvaW4oXCJ8XCIpXG5cdFx0XHQ7XG5cblx0XHRcdHJldHVybiBuZXcgUmVnRXhwKHNvdXJjZSwgJ3VnJylcblx0XHR9XG5cblx0XHRjb25zdCBpZ25vcmVzUmU6IFJlZ0V4cCA9IGhhbmRsZUlnbm9yZVJlKG9wdGlvbnMuaWdub3JlcyB8fCBbXSk7XG5cblx0XHQvKipcblx0XHQgKiByZW1vdmUgcmVnZXhwIGluIGlnbm9yZXNcblx0XHQgKiBAcGFyYW0ge1JlZ0V4cH0gcmUgaW5wdXQgcmVnZXhwXG5cdFx0ICogQHJldHVybnMge1JlZ0V4cH0gbmV3IHJlZ2V4cFxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlUmVnZXhDbGFzcyhyZTogUmVnRXhwKVxuXHRcdHtcblx0XHRcdGlmICghaWdub3Jlc1JlKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBzb3VyY2UgPSByZS5zb3VyY2UucmVwbGFjZShpZ25vcmVzUmUsIFwiXCIpO1xuXG5cdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIHJlLmZsYWdzKTtcblx0XHR9XG5cblx0XHRjb25zdCBBTExfSVJSRUdVTEFSU19MT0NBTCA9IHJlbW92ZVJlZ2V4Q2xhc3MoQUxMX0lSUkVHVUxBUlMpO1xuXHRcdGNvbnN0IElSUkVHVUxBUl9XSElURVNQQUNFX0xPQ0FMID0gcmVtb3ZlUmVnZXhDbGFzcyhJUlJFR1VMQVJfV0hJVEVTUEFDRSk7XG5cblx0XHQvKipcblx0XHQgKiBSZW1vdmVzIGVycm9ycyB0aGF0IG9jY3VyIGluc2lkZSBhIHN0cmluZyBub2RlXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZTogVFNFU1RyZWUuQmFzZU5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3QgbG9jU3RhcnQgPSBub2RlLmxvYy5zdGFydDtcblx0XHRcdGNvbnN0IGxvY0VuZCA9IG5vZGUubG9jLmVuZDtcblxuXHRcdFx0ZXJyb3JzID0gZXJyb3JzLmZpbHRlcigoeyBsb2M6IGVycm9yTG9jIH0pID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChlcnJvckxvYy5saW5lID49IGxvY1N0YXJ0LmxpbmUgJiYgZXJyb3JMb2MubGluZSA8PSBsb2NFbmQubGluZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChlcnJvckxvYy5jb2x1bW4gPj0gbG9jU3RhcnQuY29sdW1uICYmIChlcnJvckxvYy5jb2x1bW4gPD0gbG9jRW5kLmNvbHVtbiB8fCBlcnJvckxvYy5saW5lIDwgbG9jRW5kLmxpbmUpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgaWRlbnRpZmllciBvciBsaXRlcmFsIG5vZGVzIGZvciBlcnJvcnMgdGhhdCB3ZSBhcmUgY2hvb3NpbmcgdG8gaWdub3JlIGFuZCBjYWxscyB0aGUgcmVsZXZhbnQgbWV0aG9kcyB0byByZW1vdmUgdGhlIGVycm9yc1xuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSB0byBjaGVjayBmb3IgbWF0Y2hpbmcgZXJyb3JzLlxuXHRcdCAqIEByZXR1cm5zIHt2b2lkfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbklkZW50aWZpZXJPckxpdGVyYWwobm9kZTogVFNFU1RyZWUuTGl0ZXJhbClcblx0XHR7XG5cdFx0XHRjb25zdCBzaG91bGRDaGVja1N0cmluZ3MgPSBza2lwU3RyaW5ncyAmJiAodHlwZW9mIG5vZGUudmFsdWUgPT09IFwic3RyaW5nXCIpO1xuXHRcdFx0Y29uc3Qgc2hvdWxkQ2hlY2tSZWdFeHBzID0gc2tpcFJlZ0V4cHMgJiYgQm9vbGVhbihub2RlLnJlZ2V4KTtcblxuXHRcdFx0aWYgKHNob3VsZENoZWNrU3RyaW5ncyB8fCBzaG91bGRDaGVja1JlZ0V4cHMpXG5cdFx0XHR7XG5cblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBpcnJlZ3VsYXIgY2hhcmFjdGVycyByZW1vdmUgdGhlbSBmcm9tIHRoZSBlcnJvcnMgbGlzdFxuXHRcdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnJhdykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGVtcGxhdGUgc3RyaW5nIGxpdGVyYWwgbm9kZXMgZm9yIGVycm9ycyB0aGF0IHdlIGFyZSBjaG9vc2luZyB0byBpZ25vcmUgYW5kIGNhbGxzIHRoZSByZWxldmFudCBtZXRob2RzIHRvIHJlbW92ZSB0aGUgZXJyb3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIHRvIGNoZWNrIGZvciBtYXRjaGluZyBlcnJvcnMuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiByZW1vdmVJbnZhbGlkTm9kZUVycm9yc0luVGVtcGxhdGVMaXRlcmFsKG5vZGU6IFRTRVNUcmVlLlRlbXBsYXRlRWxlbWVudClcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG5vZGUudmFsdWUucmF3ID09PSBcInN0cmluZ1wiKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoQUxMX0lSUkVHVUxBUlNfTE9DQUwudGVzdChub2RlLnZhbHVlLnJhdykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZW1vdmVXaGl0ZXNwYWNlRXJyb3Iobm9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgY29tbWVudCBub2RlcyBmb3IgZXJyb3JzIHRoYXQgd2UgYXJlIGNob29zaW5nIHRvIGlnbm9yZSBhbmQgY2FsbHMgdGhlIHJlbGV2YW50IG1ldGhvZHMgdG8gcmVtb3ZlIHRoZSBlcnJvcnNcblx0XHQgKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGUgdG8gY2hlY2sgZm9yIG1hdGNoaW5nIGVycm9ycy5cblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5Db21tZW50KG5vZGU6IFRTRVNUcmVlLkNvbW1lbnQpXG5cdFx0e1xuXHRcdFx0aWYgKEFMTF9JUlJFR1VMQVJTX0xPQ0FMLnRlc3Qobm9kZS52YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJlbW92ZVdoaXRlc3BhY2VFcnJvcihub2RlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDaGVja3MgdGhlIHByb2dyYW0gc291cmNlIGZvciBpcnJlZ3VsYXIgd2hpdGVzcGFjZVxuXHRcdCAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZSBUaGUgcHJvZ3JhbSBub2RlXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBjaGVja0ZvcklycmVndWxhcldoaXRlc3BhY2Uobm9kZTogVFNFU1RyZWUuTm9kZSlcblx0XHR7XG5cdFx0XHRjb25zdCBzb3VyY2VMaW5lcyA9IHNvdXJjZUNvZGUubGluZXM7XG5cblx0XHRcdHNvdXJjZUxpbmVzLmZvckVhY2goKHNvdXJjZUxpbmUsIGxpbmVJbmRleCkgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbGluZU51bWJlciA9IGxpbmVJbmRleCArIDE7XG5cdFx0XHRcdGxldCBtYXRjaDtcblxuXHRcdFx0XHR3aGlsZSAoKG1hdGNoID0gSVJSRUdVTEFSX1dISVRFU1BBQ0VfTE9DQUwuZXhlYyhzb3VyY2VMaW5lKSkgIT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zdCBsb2NhdGlvbiA9IHtcblx0XHRcdFx0XHRcdGxpbmU6IGxpbmVOdW1iZXIsXG5cdFx0XHRcdFx0XHRjb2x1bW46IG1hdGNoLmluZGV4LFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRlcnJvcnMucHVzaCh7IG5vZGUsIG1lc3NhZ2U6IFwiSXJyZWd1bGFyIHdoaXRlc3BhY2Ugbm90IGFsbG93ZWQuXCIsIGxvYzogbG9jYXRpb24gfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENoZWNrcyB0aGUgcHJvZ3JhbSBzb3VyY2UgZm9yIGlycmVndWxhciBsaW5lIHRlcm1pbmF0b3JzXG5cdFx0ICogQHBhcmFtIHtBU1ROb2RlfSBub2RlIFRoZSBwcm9ncmFtIG5vZGVcblx0XHQgKiBAcmV0dXJucyB7dm9pZH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGNoZWNrRm9ySXJyZWd1bGFyTGluZVRlcm1pbmF0b3JzKG5vZGU6IFRTRVNUcmVlLk5vZGUpXG5cdFx0e1xuXHRcdFx0Y29uc3Qgc291cmNlID0gc291cmNlQ29kZS5nZXRUZXh0KCksXG5cdFx0XHRcdHNvdXJjZUxpbmVzID0gc291cmNlQ29kZS5saW5lcyxcblx0XHRcdFx0bGluZWJyZWFrcyA9IHNvdXJjZS5tYXRjaChMSU5FX0JSRUFLKTtcblx0XHRcdGxldCBsYXN0TGluZUluZGV4ID0gLTEsXG5cdFx0XHRcdG1hdGNoO1xuXG5cdFx0XHR3aGlsZSAoKG1hdGNoID0gSVJSRUdVTEFSX0xJTkVfVEVSTUlOQVRPUlMuZXhlYyhzb3VyY2UpKSAhPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0Y29uc3QgbGluZUluZGV4ID0gbGluZWJyZWFrcy5pbmRleE9mKG1hdGNoWzBdLCBsYXN0TGluZUluZGV4ICsgMSkgfHwgMDtcblx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSB7XG5cdFx0XHRcdFx0bGluZTogbGluZUluZGV4ICsgMSxcblx0XHRcdFx0XHRjb2x1bW46IHNvdXJjZUxpbmVzW2xpbmVJbmRleF0ubGVuZ3RoLFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGVycm9ycy5wdXNoKHsgbm9kZSwgbWVzc2FnZTogXCJJcnJlZ3VsYXIgd2hpdGVzcGFjZSBub3QgYWxsb3dlZC5cIiwgbG9jOiBsb2NhdGlvbiB9KTtcblx0XHRcdFx0bGFzdExpbmVJbmRleCA9IGxpbmVJbmRleDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBIG5vLW9wIGZ1bmN0aW9uIHRvIGFjdCBhcyBwbGFjZWhvbGRlciBmb3IgY29tbWVudCBhY2N1bXVsYXRpb24gd2hlbiB0aGUgYHNraXBDb21tZW50c2Agb3B0aW9uIGlzIGBmYWxzZWAuXG5cdFx0ICogQHJldHVybnMge3ZvaWR9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBub29wKClcblx0XHR7fVxuXG5cdFx0Y29uc3Qgbm9kZXM6IHtcblx0XHRcdC8vW2sgaW4gQVNUX05PREVfVFlQRVNdPzogKG5vZGU/OiBUU0VTVHJlZS5Ob2RlKSA9PiB2b2lkXG5cdFx0fSAmIHtcblxuXHRcdFx0XCJQcm9ncmFtOmV4aXRcIj86ICgpID0+IHZvaWQ7XG5cblx0XHRcdFByb2dyYW0/KG5vZGU6IFRTRVNUcmVlLlByb2dyYW0pOiB2b2lkO1xuXHRcdFx0SWRlbnRpZmllcj8obm9kZTogVFNFU1RyZWUuTGl0ZXJhbCk6IHZvaWQ7XG5cdFx0XHRMaXRlcmFsPyhub2RlOiBUU0VTVHJlZS5MaXRlcmFsKTogdm9pZDtcblx0XHRcdFRlbXBsYXRlRWxlbWVudD8obm9kZTogVFNFU1RyZWUuVGVtcGxhdGVFbGVtZW50KTogdm9pZDtcblxuXHRcdH0gPSB7fTtcblxuXHRcdGlmIChBTExfSVJSRUdVTEFSU19MT0NBTC50ZXN0KHNvdXJjZUNvZGUuZ2V0VGV4dCgpKSlcblx0XHR7XG5cdFx0XHRub2Rlcy5Qcm9ncmFtID0gZnVuY3Rpb24gKG5vZGUpXG5cdFx0XHR7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0ICogQXMgd2UgY2FuIGVhc2lseSBmaXJlIHdhcm5pbmdzIGZvciBhbGwgd2hpdGUgc3BhY2UgaXNzdWVzIHdpdGhcblx0XHRcdFx0ICogYWxsIHRoZSBzb3VyY2UgaXRzIHNpbXBsZXIgdG8gZmlyZSB0aGVtIGhlcmUuXG5cdFx0XHRcdCAqIFRoaXMgbWVhbnMgd2UgY2FuIGNoZWNrIGFsbCB0aGUgYXBwbGljYXRpb24gY29kZSB3aXRob3V0IGhhdmluZ1xuXHRcdFx0XHQgKiB0byB3b3JyeSBhYm91dCBpc3N1ZXMgY2F1c2VkIGluIHRoZSBwYXJzZXIgdG9rZW5zLlxuXHRcdFx0XHQgKiBXaGVuIHdyaXRpbmcgdGhpcyBjb2RlIGFsc28gZXZhbHVhdGluZyBwZXIgbm9kZSB3YXMgbWlzc2luZyBvdXRcblx0XHRcdFx0ICogY29ubmVjdGluZyB0b2tlbnMgaW4gc29tZSBjYXNlcy5cblx0XHRcdFx0ICogV2UgY2FuIGxhdGVyIGZpbHRlciB0aGUgZXJyb3JzIHdoZW4gdGhleSBhcmUgZm91bmQgdG8gYmUgbm90IGFuXG5cdFx0XHRcdCAqIGlzc3VlIGluIG5vZGVzIHdlIGRvbid0IGNhcmUgYWJvdXQuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRjaGVja0ZvcklycmVndWxhcldoaXRlc3BhY2Uobm9kZSk7XG5cdFx0XHRcdGNoZWNrRm9ySXJyZWd1bGFyTGluZVRlcm1pbmF0b3JzKG5vZGUpO1xuXHRcdFx0fTtcblxuXHRcdFx0bm9kZXMuSWRlbnRpZmllciA9IHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5JZGVudGlmaWVyT3JMaXRlcmFsO1xuXHRcdFx0bm9kZXMuTGl0ZXJhbCA9IHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5JZGVudGlmaWVyT3JMaXRlcmFsO1xuXHRcdFx0bm9kZXMuVGVtcGxhdGVFbGVtZW50ID0gc2tpcFRlbXBsYXRlcyA/IHJlbW92ZUludmFsaWROb2RlRXJyb3JzSW5UZW1wbGF0ZUxpdGVyYWwgOiBub29wO1xuXHRcdFx0bm9kZXNbXCJQcm9ncmFtOmV4aXRcIl0gPSBmdW5jdGlvbiAoKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoc2tpcENvbW1lbnRzKVxuXHRcdFx0XHR7XG5cblx0XHRcdFx0XHQvLyBGaXJzdCBzdHJpcCBlcnJvcnMgb2NjdXJyaW5nIGluIGNvbW1lbnQgbm9kZXMuXG5cdFx0XHRcdFx0Y29tbWVudE5vZGVzLmZvckVhY2gocmVtb3ZlSW52YWxpZE5vZGVFcnJvcnNJbkNvbW1lbnQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBhbnkgZXJyb3JzIHJlbWFpbmluZyByZXBvcnQgb24gdGhlbVxuXHRcdFx0XHRlcnJvcnMuZm9yRWFjaChlcnJvciA9PiBjb250ZXh0LnJlcG9ydChlcnJvcikpO1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdG5vZGVzLlByb2dyYW0gPSBub29wO1xuXHRcdH1cblxuXHRcdHJldHVybiBub2Rlcztcblx0fSxcbn0gYXMgY29uc3Q7XG4iXX0=