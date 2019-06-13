"use strict";
/**
 * Created by user on 2019/6/14.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const find_tsconfig_1 = require("@yarn-tool/find-tsconfig");
function addTsconfig(eslintrcJson, options) {
    let { cwd = process.cwd(), overwrite } = options || {};
    if (overwrite || !eslintrcJson.parserOptions.project) {
        let file = find_tsconfig_1.findTsconfig(cwd);
        if (file) {
            eslintrcJson.parserOptions.project = file;
        }
    }
    return eslintrcJson;
}
exports.addTsconfig = addTsconfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDREQUF3RDtBQUV4RCxTQUFnQixXQUFXLENBQUMsWUFLMUIsRUFBRSxPQUdIO0lBRUEsSUFBSSxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUV2RCxJQUFJLFNBQVMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUNwRDtRQUNDLElBQUksSUFBSSxHQUFHLDRCQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0IsSUFBSSxJQUFJLEVBQ1I7WUFDQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDMUM7S0FDRDtJQUVELE9BQU8sWUFBWSxDQUFBO0FBQ3BCLENBQUM7QUF2QkQsa0NBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS82LzE0LlxuICovXG5cbmltcG9ydCB7IGZpbmRUc2NvbmZpZyB9IGZyb20gJ0B5YXJuLXRvb2wvZmluZC10c2NvbmZpZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUc2NvbmZpZyhlc2xpbnRyY0pzb246UGFydGlhbDx7XG5cdHBhcnNlck9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ICYge1xuXHRcdHByb2plY3Q/OiBzdHJpbmcsXG5cdFx0cGFyc2VyPzogc3RyaW5nLFxuXHR9XG59Piwgb3B0aW9ucz86IHtcblx0Y3dkPzogc3RyaW5nLFxuXHRvdmVyd3JpdGU/OiBib29sZWFuLFxufSlcbntcblx0bGV0IHsgY3dkID0gcHJvY2Vzcy5jd2QoKSwgb3ZlcndyaXRlIH0gPSBvcHRpb25zIHx8IHt9O1xuXG5cdGlmIChvdmVyd3JpdGUgfHwgIWVzbGludHJjSnNvbi5wYXJzZXJPcHRpb25zLnByb2plY3QpXG5cdHtcblx0XHRsZXQgZmlsZSA9IGZpbmRUc2NvbmZpZyhjd2QpO1xuXG5cdFx0aWYgKGZpbGUpXG5cdFx0e1xuXHRcdFx0ZXNsaW50cmNKc29uLnBhcnNlck9wdGlvbnMucHJvamVjdCA9IGZpbGU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGVzbGludHJjSnNvblxufVxuIl19