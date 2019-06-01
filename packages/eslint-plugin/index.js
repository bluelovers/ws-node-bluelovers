"use strict";
/**
 * Created by user on 2019/6/1.
 */
const rule_1 = require("./rule");
const _config = {
    rules: {
        // @ts-ignore
        "@bluelovers/no-irregular-whitespace": [
            "error",
            {
                "skipComments": true,
                "skipStrings": false,
                "skipTemplates": false,
                "skipRegExps": false,
            },
        ],
    },
};
module.exports = {
    rules: rule_1.default,
    configs: {
        all: {
            ..._config,
        },
        base: {
            ..._config,
        },
        recommended: {
            ..._config,
            "@bluelovers/no-irregular-whitespace": [
                "error",
                {
                    "skipComments": true,
                    "skipStrings": false,
                    "skipTemplates": false,
                    "skipRegExps": false,
                    "ignores": ['\u3000'],
                },
            ],
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFFSCxpQ0FBMkI7QUFHM0IsTUFBTSxPQUFPLEdBQWlDO0lBQzdDLEtBQUssRUFBRTtRQUNOLGFBQWE7UUFDYixxQ0FBcUMsRUFBRTtZQUN0QyxPQUFPO1lBQ1A7Z0JBQ0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixlQUFlLEVBQUUsS0FBSztnQkFDdEIsYUFBYSxFQUFFLEtBQUs7YUFDcEI7U0FDRDtLQUNEO0NBQ0QsQ0FBQztBQUVGLGlCQUFTO0lBRVIsS0FBSyxFQUFMLGNBQUs7SUFFTCxPQUFPLEVBQUU7UUFDUixHQUFHLEVBQUU7WUFDSixHQUFHLE9BQU87U0FDVjtRQUNELElBQUksRUFBRTtZQUNMLEdBQUcsT0FBTztTQUNWO1FBQ0QsV0FBVyxFQUFFO1lBQ1osR0FBRyxPQUFPO1lBQ1YscUNBQXFDLEVBQUU7Z0JBQ3RDLE9BQU87Z0JBQ1A7b0JBQ0MsY0FBYyxFQUFFLElBQUk7b0JBQ3BCLGFBQWEsRUFBRSxLQUFLO29CQUNwQixlQUFlLEVBQUUsS0FBSztvQkFDdEIsYUFBYSxFQUFFLEtBQUs7b0JBQ3BCLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQztpQkFDckI7YUFDRDtTQUNEO0tBQ0Q7Q0FFRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS82LzEuXG4gKi9cblxuaW1wb3J0IHJ1bGVzIGZyb20gJy4vcnVsZSc7XG5pbXBvcnQgZXNsaW50cmNKc29uID0gcmVxdWlyZSgnZXNsaW50LWNvbmZpZy1ibHVlbG92ZXJzJyk7XG5cbmNvbnN0IF9jb25maWc6IFBhcnRpYWw8dHlwZW9mIGVzbGludHJjSnNvbj4gPSB7XG5cdHJ1bGVzOiB7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFwiQGJsdWVsb3ZlcnMvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIjogW1xuXHRcdFx0XCJlcnJvclwiLFxuXHRcdFx0e1xuXHRcdFx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFx0XHRcInNraXBTdHJpbmdzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdF0sXG5cdH0sXG59O1xuXG5leHBvcnQgPSB7XG5cblx0cnVsZXMsXG5cblx0Y29uZmlnczoge1xuXHRcdGFsbDoge1xuXHRcdFx0Li4uX2NvbmZpZyxcblx0XHR9LFxuXHRcdGJhc2U6IHtcblx0XHRcdC4uLl9jb25maWcsXG5cdFx0fSxcblx0XHRyZWNvbW1lbmRlZDoge1xuXHRcdFx0Li4uX2NvbmZpZyxcblx0XHRcdFwiQGJsdWVsb3ZlcnMvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIjogW1xuXHRcdFx0XHRcImVycm9yXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFx0XHRcdFwic2tpcFN0cmluZ3NcIjogZmFsc2UsXG5cdFx0XHRcdFx0XCJza2lwVGVtcGxhdGVzXCI6IGZhbHNlLFxuXHRcdFx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHRcdFx0XCJpZ25vcmVzXCI6IFsnXFx1MzAwMCddLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG59O1xuIl19