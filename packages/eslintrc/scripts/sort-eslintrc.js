"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const EslintrcJson = require("../.eslintrc.json");
const sortObject = require("sort-object-keys2");
const fs = require("fs");
const path = require("path");
// @ts-ignore
EslintrcJson.rules = sortObject(EslintrcJson.rules, {
    keys: orderTweak(Object.keys(EslintrcJson.rules).sort().sort(function (a, b) {
        // @ts-ignore
        let i1 = a.startsWith('@') | 0;
        // @ts-ignore
        let i2 = b.startsWith('@') | 0;
        let r = i1 - i2;
        return r;
    }), [
        ['semi', '@typescript-eslint/semi',],
        ['no-extra-parens', '@typescript-eslint/no-extra-parens',],
        ['func-call-spacing', '@typescript-eslint/func-call-spacing',],
        ['indent', '@typescript-eslint/indent',],
        ['no-magic-numbers', '@typescript-eslint/no-magic-numbers',],
        ['camelcase', '@typescript-eslint/camelcase',],
        ['no-unused-vars', '@typescript-eslint/no-unused-vars',],
        ['no-use-before-define', '@typescript-eslint/no-use-before-define',],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1lc2xpbnRyYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQtZXNsaW50cmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGtEQUFtRDtBQUNuRCxnREFBaUQ7QUFDakQseUJBQTBCO0FBQzFCLDZCQUE4QjtBQUU5QixhQUFhO0FBQ2IsWUFBWSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtJQUNuRCxJQUFJLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBRTFFLGFBQWE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixhQUFhO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUVoQixPQUFPLENBQUMsQ0FBQTtJQUNULENBQUMsQ0FBQyxFQUFFO1FBRUgsQ0FBQyxNQUFNLEVBQUUseUJBQXlCLEVBQUU7UUFDcEMsQ0FBQyxpQkFBaUIsRUFBRSxvQ0FBb0MsRUFBRTtRQUMxRCxDQUFDLG1CQUFtQixFQUFFLHNDQUFzQyxFQUFFO1FBQzlELENBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFFO1FBQ3hDLENBQUMsa0JBQWtCLEVBQUUscUNBQXFDLEVBQUU7UUFDNUQsQ0FBQyxXQUFXLEVBQUUsOEJBQThCLEVBQUU7UUFDOUMsQ0FBQyxnQkFBZ0IsRUFBRSxtQ0FBbUMsRUFBRTtRQUN4RCxDQUFDLHNCQUFzQixFQUFFLHlDQUF5QyxFQUFFO0tBRXBFLEVBQUUsSUFBSSxDQUFDO0NBQ1IsQ0FBQyxDQUFDO0FBRUgsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRWpELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFckUsU0FBZ0IsVUFBVSxDQUFtQixJQUFTLEVBQUUsTUFBd0IsRUFBRSxJQUFjO0lBRS9GLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUV2QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVkLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbkIsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDakI7WUFDQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBSSxFQUFFLENBQUksRUFBRSxFQUFFO2dCQUV4QixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV4QixJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQzFCO29CQUNDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ25CO3dCQUNDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFakIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDbEI7eUJBQ0ksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUN6Qjt3QkFDQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7cUJBQ3hCO2lCQUNEO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUE7U0FDRjtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBcENELGdDQW9DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8yOS5cbiAqL1xuXG5pbXBvcnQgRXNsaW50cmNKc29uID0gcmVxdWlyZSgnLi4vLmVzbGludHJjLmpzb24nKTtcbmltcG9ydCBzb3J0T2JqZWN0ID0gcmVxdWlyZSgnc29ydC1vYmplY3Qta2V5czInKTtcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuLy8gQHRzLWlnbm9yZVxuRXNsaW50cmNKc29uLnJ1bGVzID0gc29ydE9iamVjdChFc2xpbnRyY0pzb24ucnVsZXMsIHtcblx0a2V5czogb3JkZXJUd2VhayhPYmplY3Qua2V5cyhFc2xpbnRyY0pzb24ucnVsZXMpLnNvcnQoKS5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBpMSA9IGEuc3RhcnRzV2l0aCgnQCcpIHwgMDtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IGkyID0gYi5zdGFydHNXaXRoKCdAJykgfCAwO1xuXG5cdFx0bGV0IHIgPSBpMSAtIGkyO1xuXG5cdFx0cmV0dXJuIHJcblx0fSksIFtcblxuXHRcdFsnc2VtaScsICdAdHlwZXNjcmlwdC1lc2xpbnQvc2VtaScsXSxcblx0XHRbJ25vLWV4dHJhLXBhcmVucycsICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXh0cmEtcGFyZW5zJyxdLFxuXHRcdFsnZnVuYy1jYWxsLXNwYWNpbmcnLCAnQHR5cGVzY3JpcHQtZXNsaW50L2Z1bmMtY2FsbC1zcGFjaW5nJyxdLFxuXHRcdFsnaW5kZW50JywgJ0B0eXBlc2NyaXB0LWVzbGludC9pbmRlbnQnLF0sXG5cdFx0Wyduby1tYWdpYy1udW1iZXJzJywgJ0B0eXBlc2NyaXB0LWVzbGludC9uby1tYWdpYy1udW1iZXJzJyxdLFxuXHRcdFsnY2FtZWxjYXNlJywgJ0B0eXBlc2NyaXB0LWVzbGludC9jYW1lbGNhc2UnLF0sXG5cdFx0Wyduby11bnVzZWQtdmFycycsICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnMnLF0sXG5cdFx0Wyduby11c2UtYmVmb3JlLWRlZmluZScsICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdXNlLWJlZm9yZS1kZWZpbmUnLF0sXG5cblx0XSwgdHJ1ZSksXG59KTtcblxubGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShFc2xpbnRyY0pzb24sIG51bGwsIDIpO1xuXG5mcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICcuZXNsaW50cmMuanNvbicpLCBqc29uKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9yZGVyVHdlYWs8VCBleHRlbmRzIHN0cmluZz4oa2V5czogVFtdLCBncm91cHM6IChUIHwgc3RyaW5nKVtdW10sIG1vZGU/OiBib29sZWFuKVxue1xuXHRsZXQgcmV0ID0ga2V5cy5zbGljZSgpO1xuXG5cdG1vZGUgPSAhIW1vZGU7XG5cblx0Z3JvdXBzLmZvckVhY2gobHMgPT4ge1xuXHRcdGlmIChscy5sZW5ndGggPiAxKVxuXHRcdHtcblx0XHRcdGxzLnJlZHVjZSgocDogVCwgazogVCkgPT4ge1xuXG5cdFx0XHRcdGxldCBwaSA9IHJldC5pbmRleE9mKHApO1xuXHRcdFx0XHRsZXQga2kgPSByZXQuaW5kZXhPZihrKTtcblxuXHRcdFx0XHRpZiAocGkgIT09IC0xICYmIGtpICE9PSAtMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChtb2RlICYmIGtpID4gcGkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHBzID0gcmV0W3BpXTtcblxuXHRcdFx0XHRcdFx0cmV0LnNwbGljZShraSwgMCwgcHMpO1xuXHRcdFx0XHRcdFx0cmV0LnNwbGljZShwaSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFtb2RlICYmIGtpIDwgcGkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IHBhID0gcmV0LnNwbGljZShwaSwgMSk7XG5cdFx0XHRcdFx0XHRyZXQuc3BsaWNlKGtpLCAwLCAuLi5wYSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gaztcblx0XHRcdH0pXG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gcmV0O1xufVxuXG5cbiJdfQ==