"use strict";
/**
 * Created by user on 2019/6/1.
 */
const rule_1 = require("./rule");
const cloneDeep = require("lodash.clonedeep");
const _config = {
    rules: {
        // @ts-ignore
        "no-irregular-whitespace": [
            "off",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
            },
        ],
        "@bluelovers/no-irregular-whitespace": [
            "error",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
            },
        ]
    },
};
const recommended = {
    ...cloneDeep(_config),
    rules: {
        ...cloneDeep(_config.rules),
        "@bluelovers/no-irregular-whitespace": [
            "error",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
                "ignores": ['\u3000'],
            },
        ]
    }
};
module.exports = {
    rules: rule_1.default,
    configs: {
        all: cloneDeep(_config),
        base: cloneDeep(_config),
        recommended,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFFSCxpQ0FBMkI7QUFJM0IsOENBQStDO0FBRS9DLE1BQU0sT0FBTyxHQUFHO0lBQ2YsS0FBSyxFQUFFO1FBQ04sYUFBYTtRQUNiLHlCQUF5QixFQUFFO1lBQzFCLEtBQUs7WUFDTDtnQkFDQyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixhQUFhLEVBQUUsS0FBSzthQUNSO1NBQ2I7UUFDRCxxQ0FBcUMsRUFBRTtZQUN0QyxPQUFPO1lBQ1A7Z0JBQ0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixlQUFlLEVBQUUsS0FBSztnQkFDdEIsYUFBYSxFQUFFLEtBQUs7YUFDUjtTQUNiO0tBQ0Q7Q0FDRCxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQW1CO0lBQ25DLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztJQUNyQixLQUFLLEVBQUU7UUFDTixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLHFDQUFxQyxFQUFFO1lBQ3RDLE9BQU87WUFDUDtnQkFDQyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixhQUFhLEVBQUUsS0FBSztnQkFDcEIsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2FBQ1Q7U0FDYjtLQUNEO0NBQ0QsQ0FBQztBQUVGLGlCQUFTO0lBRVIsS0FBSyxFQUFMLGNBQUs7SUFFTCxPQUFPLEVBQUU7UUFDUixHQUFHLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBbUI7UUFDekMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQW1CO1FBQzFDLFdBQVc7S0FDWDtDQUVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzYvMS5cbiAqL1xuXG5pbXBvcnQgcnVsZXMgZnJvbSAnLi9ydWxlJztcbmltcG9ydCBlc2xpbnRyY0pzb24gPSByZXF1aXJlKCdlc2xpbnQtY29uZmlnLWJsdWVsb3ZlcnMnKTtcbmltcG9ydCB7IElPcHRpb25zIH0gZnJvbSAnLi9ydWxlL25vLWlycmVndWxhci13aGl0ZXNwYWNlJztcblxuaW1wb3J0IGNsb25lRGVlcCA9IHJlcXVpcmUoJ2xvZGFzaC5jbG9uZWRlZXAnKTtcblxuY29uc3QgX2NvbmZpZyA9IHtcblx0cnVsZXM6IHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XCJuby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiOiBbXG5cdFx0XHRcIm9mZlwiLFxuXHRcdFx0e1xuXHRcdFx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFx0XHRcInNraXBTdHJpbmdzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHR9IGFzIElPcHRpb25zLFxuXHRcdF0sXG5cdFx0XCJAYmx1ZWxvdmVycy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiOiBbXG5cdFx0XHRcImVycm9yXCIsXG5cdFx0XHR7XG5cdFx0XHRcdFwic2tpcENvbW1lbnRzXCI6IHRydWUsXG5cdFx0XHRcdFwic2tpcFN0cmluZ3NcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFRlbXBsYXRlc1wiOiBmYWxzZSxcblx0XHRcdFx0XCJza2lwUmVnRXhwc1wiOiBmYWxzZSxcblx0XHRcdH0gYXMgSU9wdGlvbnMsXG5cdFx0XVxuXHR9LFxufTtcblxuY29uc3QgcmVjb21tZW5kZWQ6IHR5cGVvZiBfY29uZmlnID0ge1xuXHQuLi5jbG9uZURlZXAoX2NvbmZpZyksXG5cdHJ1bGVzOiB7XG5cdFx0Li4uY2xvbmVEZWVwKF9jb25maWcucnVsZXMpLFxuXHRcdFwiQGJsdWVsb3ZlcnMvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIjogW1xuXHRcdFx0XCJlcnJvclwiLFxuXHRcdFx0e1xuXHRcdFx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFx0XHRcInNraXBTdHJpbmdzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHRcdFwiaWdub3Jlc1wiOiBbJ1xcdTMwMDAnXSxcblx0XHRcdH0gYXMgSU9wdGlvbnMsXG5cdFx0XVxuXHR9XG59O1xuXG5leHBvcnQgPSB7XG5cblx0cnVsZXMsXG5cblx0Y29uZmlnczoge1xuXHRcdGFsbDogY2xvbmVEZWVwKF9jb25maWcpIGFzIHR5cGVvZiBfY29uZmlnLFxuXHRcdGJhc2U6IGNsb25lRGVlcChfY29uZmlnKSBhcyB0eXBlb2YgX2NvbmZpZyxcblx0XHRyZWNvbW1lbmRlZCxcblx0fSxcblxufTtcbiJdfQ==