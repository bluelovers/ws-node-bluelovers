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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1lc2xpbnRyYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNvcnQtZXNsaW50cmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGtEQUFtRDtBQUNuRCxnREFBaUQ7QUFDakQseUJBQTBCO0FBQzFCLDZCQUE4QjtBQUU5QixhQUFhO0FBQ2IsWUFBWSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtJQUNuRCxJQUFJLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBRTFFLGFBQWE7UUFDYixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixhQUFhO1FBQ2IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUVoQixPQUFPLENBQUMsQ0FBQTtJQUNULENBQUMsQ0FBQyxFQUFFO1FBRUgsQ0FBQyxNQUFNLEVBQUUseUJBQXlCLEVBQUU7UUFDcEMsQ0FBQyxpQkFBaUIsRUFBRSxvQ0FBb0MsRUFBRTtRQUMxRCxDQUFDLG1CQUFtQixFQUFFLHNDQUFzQyxFQUFFO1FBQzlELENBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFFO1FBQ3hDLENBQUMsa0JBQWtCLEVBQUUscUNBQXFDLEVBQUU7UUFDNUQsQ0FBQyxXQUFXLEVBQUUsOEJBQThCLEVBQUU7UUFDOUMsQ0FBQyxnQkFBZ0IsRUFBRSxtQ0FBbUMsRUFBRTtLQUV4RCxFQUFFLElBQUksQ0FBQztDQUNSLENBQUMsQ0FBQztBQUVILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVqRCxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRXJFLFNBQWdCLFVBQVUsQ0FBbUIsSUFBUyxFQUFFLE1BQXdCLEVBQUUsSUFBYztJQUUvRixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFdkIsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFZCxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ25CLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2pCO1lBQ0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUksRUFBRSxDQUFJLEVBQUUsRUFBRTtnQkFFeEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUMxQjtvQkFDQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUNuQjt3QkFDQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRWpCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ2xCO3lCQUNJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsRUFDekI7d0JBQ0MsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzNCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO3FCQUN4QjtpQkFDRDtnQkFFRCxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFBO1NBQ0Y7SUFDRixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQXBDRCxnQ0FvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMjkuXG4gKi9cblxuaW1wb3J0IEVzbGludHJjSnNvbiA9IHJlcXVpcmUoJy4uLy5lc2xpbnRyYy5qc29uJyk7XG5pbXBvcnQgc29ydE9iamVjdCA9IHJlcXVpcmUoJ3NvcnQtb2JqZWN0LWtleXMyJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbi8vIEB0cy1pZ25vcmVcbkVzbGludHJjSnNvbi5ydWxlcyA9IHNvcnRPYmplY3QoRXNsaW50cmNKc29uLnJ1bGVzLCB7XG5cdGtleXM6IG9yZGVyVHdlYWsoT2JqZWN0LmtleXMoRXNsaW50cmNKc29uLnJ1bGVzKS5zb3J0KCkuc29ydChmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgaTEgPSBhLnN0YXJ0c1dpdGgoJ0AnKSB8IDA7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCBpMiA9IGIuc3RhcnRzV2l0aCgnQCcpIHwgMDtcblxuXHRcdGxldCByID0gaTEgLSBpMjtcblxuXHRcdHJldHVybiByXG5cdH0pLCBbXG5cblx0XHRbJ3NlbWknLCAnQHR5cGVzY3JpcHQtZXNsaW50L3NlbWknLF0sXG5cdFx0Wyduby1leHRyYS1wYXJlbnMnLCAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4dHJhLXBhcmVucycsXSxcblx0XHRbJ2Z1bmMtY2FsbC1zcGFjaW5nJywgJ0B0eXBlc2NyaXB0LWVzbGludC9mdW5jLWNhbGwtc3BhY2luZycsXSxcblx0XHRbJ2luZGVudCcsICdAdHlwZXNjcmlwdC1lc2xpbnQvaW5kZW50JyxdLFxuXHRcdFsnbm8tbWFnaWMtbnVtYmVycycsICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbWFnaWMtbnVtYmVycycsXSxcblx0XHRbJ2NhbWVsY2FzZScsICdAdHlwZXNjcmlwdC1lc2xpbnQvY2FtZWxjYXNlJyxdLFxuXHRcdFsnbm8tdW51c2VkLXZhcnMnLCAnQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzJyxdLFxuXG5cdF0sIHRydWUpLFxufSk7XG5cbmxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoRXNsaW50cmNKc29uLCBudWxsLCAyKTtcblxuZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLmVzbGludHJjLmpzb24nKSwganNvbik7XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmRlclR3ZWFrPFQgZXh0ZW5kcyBzdHJpbmc+KGtleXM6IFRbXSwgZ3JvdXBzOiAoVCB8IHN0cmluZylbXVtdLCBtb2RlPzogYm9vbGVhbilcbntcblx0bGV0IHJldCA9IGtleXMuc2xpY2UoKTtcblxuXHRtb2RlID0gISFtb2RlO1xuXG5cdGdyb3Vwcy5mb3JFYWNoKGxzID0+IHtcblx0XHRpZiAobHMubGVuZ3RoID4gMSlcblx0XHR7XG5cdFx0XHRscy5yZWR1Y2UoKHA6IFQsIGs6IFQpID0+IHtcblxuXHRcdFx0XHRsZXQgcGkgPSByZXQuaW5kZXhPZihwKTtcblx0XHRcdFx0bGV0IGtpID0gcmV0LmluZGV4T2Yoayk7XG5cblx0XHRcdFx0aWYgKHBpICE9PSAtMSAmJiBraSAhPT0gLTEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAobW9kZSAmJiBraSA+IHBpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwcyA9IHJldFtwaV07XG5cblx0XHRcdFx0XHRcdHJldC5zcGxpY2Uoa2ksIDAsIHBzKTtcblx0XHRcdFx0XHRcdHJldC5zcGxpY2UocGksIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICghbW9kZSAmJiBraSA8IHBpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBwYSA9IHJldC5zcGxpY2UocGksIDEpO1xuXHRcdFx0XHRcdFx0cmV0LnNwbGljZShraSwgMCwgLi4ucGEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGs7XG5cdFx0XHR9KVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHJldDtcbn1cblxuXG4iXX0=