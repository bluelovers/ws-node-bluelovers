"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const EslintrcJson = require("../.eslintrc.json");
const sortObject = require("sort-object-keys2");
const fs = require("fs");
const path = require("path");
let keys = Object.keys(EslintrcJson.rules)
    .sort()
    .sort(function (a, b) {
    // @ts-ignore
    let i1 = a.startsWith('@') | 0;
    // @ts-ignore
    let i2 = b.startsWith('@') | 0;
    let r = i1 - i2;
    return r;
});
// @ts-ignore
EslintrcJson.rules = sortObject(EslintrcJson.rules, {
    keys: orderTweak(keys, [
        ...keys.reduce((a, b) => {
            if (/^@typescript-eslint\/(.+)$/.test(b)) {
                a.push([RegExp.$1, b]);
            }
            return a;
        }, []),
    ], true),
});
let json = JSON.stringify(EslintrcJson, null, 2);
fs.writeFileSync(path.join(__dirname, '..', '.eslintrc.json'), json);
function orderTweak(keys, groups, mode) {
    let ret = keys.slice();
    mode = !!mode;
    groups.forEach(ls => {
        if (ls.length > 1) {
            ls.reduce((p, k) => {
                let pi = ret.indexOf(p);
                let ki = ret.indexOf(k);
                if (pi !== -1 && ki !== -1) {
                    if (mode && ki > pi) {
                        let ps = ret[pi];
                        ret.splice(ki, 0, ps);
                        ret.splice(pi, 1);
                    }
                    else if (!mode && ki < pi) {
                        let pa = ret.splice(pi, 1);
                        ret.splice(ki, 0, ...pa);
                    }
                }
                return k;
            });
        }
    });
    return ret;
}
exports.orderTweak = orderTweak;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1lc2xpbnRyYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQtZXNsaW50cmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGtEQUFtRDtBQUNuRCxnREFBaUQ7QUFDakQseUJBQTBCO0FBQzFCLDZCQUE4QjtBQUU5QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7S0FDeEMsSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7SUFFbkIsYUFBYTtJQUNiLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGFBQWE7SUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUUvQixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBRWhCLE9BQU8sQ0FBQyxDQUFBO0FBQ1QsQ0FBQyxDQUFDLENBQ0Y7QUFFRCxhQUFhO0FBQ2IsWUFBWSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtJQUNuRCxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRTtRQUV0QixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFFdkIsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3hDO2dCQUNDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7YUFDdEI7WUFFRCxPQUFPLENBQUMsQ0FBQTtRQUNULENBQUMsRUFBRSxFQUFnQixDQUFDO0tBYXBCLEVBQUUsSUFBSSxDQUFDO0NBQ1IsQ0FBQyxDQUFDO0FBRUgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRWpELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFckUsU0FBZ0IsVUFBVSxDQUFtQixJQUFTLEVBQUUsTUFBd0IsRUFBRSxJQUFjO0lBRS9GLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUV2QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFbkIsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDakI7WUFDQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBSSxFQUFFLENBQUksRUFBRSxFQUFFO2dCQUd4QixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV4QixJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQzFCO29CQUNDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ25CO3dCQUNDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFakIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDbEI7eUJBQ0ksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUN6Qjt3QkFDQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7cUJBQ3hCO2lCQUNEO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUE7U0FDRjtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBdENELGdDQXNDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8yOS5cbiAqL1xuXG5pbXBvcnQgRXNsaW50cmNKc29uID0gcmVxdWlyZSgnLi4vLmVzbGludHJjLmpzb24nKTtcbmltcG9ydCBzb3J0T2JqZWN0ID0gcmVxdWlyZSgnc29ydC1vYmplY3Qta2V5czInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxubGV0IGtleXMgPSBPYmplY3Qua2V5cyhFc2xpbnRyY0pzb24ucnVsZXMpXG5cdC5zb3J0KClcblx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IGkxID0gYS5zdGFydHNXaXRoKCdAJykgfCAwO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgaTIgPSBiLnN0YXJ0c1dpdGgoJ0AnKSB8IDA7XG5cblx0XHRsZXQgciA9IGkxIC0gaTI7XG5cblx0XHRyZXR1cm4gclxuXHR9KVxuO1xuXG4vLyBAdHMtaWdub3JlXG5Fc2xpbnRyY0pzb24ucnVsZXMgPSBzb3J0T2JqZWN0KEVzbGludHJjSnNvbi5ydWxlcywge1xuXHRrZXlzOiBvcmRlclR3ZWFrKGtleXMsIFtcblxuXHRcdC4uLmtleXMucmVkdWNlKChhLCBiKSA9PiB7XG5cblx0XHRcdGlmICgvXkB0eXBlc2NyaXB0LWVzbGludFxcLyguKykkLy50ZXN0KGIpKVxuXHRcdFx0e1xuXHRcdFx0XHRhLnB1c2goW1JlZ0V4cC4kMSwgYl0pXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhXG5cdFx0fSwgW10gYXMgc3RyaW5nW11bXSksXG5cblx0XHQvKlxuXHRcdFsnc2VtaScsICdAdHlwZXNjcmlwdC1lc2xpbnQvc2VtaSddLFxuXHRcdFsnbm8tZXh0cmEtcGFyZW5zJywgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1leHRyYS1wYXJlbnMnXSxcblx0XHRbJ2Z1bmMtY2FsbC1zcGFjaW5nJywgJ0B0eXBlc2NyaXB0LWVzbGludC9mdW5jLWNhbGwtc3BhY2luZyddLFxuXHRcdFsnaW5kZW50JywgJ0B0eXBlc2NyaXB0LWVzbGludC9pbmRlbnQnXSxcblx0XHRbJ25vLW1hZ2ljLW51bWJlcnMnLCAnQHR5cGVzY3JpcHQtZXNsaW50L25vLW1hZ2ljLW51bWJlcnMnXSxcblx0XHRbJ2NhbWVsY2FzZScsICdAdHlwZXNjcmlwdC1lc2xpbnQvY2FtZWxjYXNlJ10sXG5cdFx0Wyduby11bnVzZWQtdmFycycsICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnMnXSxcblx0XHRbJ25vLXVzZS1iZWZvcmUtZGVmaW5lJywgJ0B0eXBlc2NyaXB0LWVzbGludC9uby11c2UtYmVmb3JlLWRlZmluZSddLFxuXHRcdCAqL1xuXG5cdF0sIHRydWUpLFxufSk7XG5cbmxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoRXNsaW50cmNKc29uLCBudWxsLCAyKTtcblxuZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLmVzbGludHJjLmpzb24nKSwganNvbik7XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmRlclR3ZWFrPFQgZXh0ZW5kcyBzdHJpbmc+KGtleXM6IFRbXSwgZ3JvdXBzOiAoVCB8IHN0cmluZylbXVtdLCBtb2RlPzogYm9vbGVhbilcbntcblx0bGV0IHJldCA9IGtleXMuc2xpY2UoKTtcblxuXHRtb2RlID0gISFtb2RlO1xuXG5cdGdyb3Vwcy5mb3JFYWNoKGxzID0+XG5cdHtcblx0XHRpZiAobHMubGVuZ3RoID4gMSlcblx0XHR7XG5cdFx0XHRscy5yZWR1Y2UoKHA6IFQsIGs6IFQpID0+XG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IHBpID0gcmV0LmluZGV4T2YocCk7XG5cdFx0XHRcdGxldCBraSA9IHJldC5pbmRleE9mKGspO1xuXG5cdFx0XHRcdGlmIChwaSAhPT0gLTEgJiYga2kgIT09IC0xKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKG1vZGUgJiYga2kgPiBwaSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgcHMgPSByZXRbcGldO1xuXG5cdFx0XHRcdFx0XHRyZXQuc3BsaWNlKGtpLCAwLCBwcyk7XG5cdFx0XHRcdFx0XHRyZXQuc3BsaWNlKHBpLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoIW1vZGUgJiYga2kgPCBwaSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgcGEgPSByZXQuc3BsaWNlKHBpLCAxKTtcblx0XHRcdFx0XHRcdHJldC5zcGxpY2Uoa2ksIDAsIC4uLnBhKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBrO1xuXHRcdFx0fSlcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiByZXQ7XG59XG5cblxuIl19