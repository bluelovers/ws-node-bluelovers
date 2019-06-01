"use strict";
/**
 * Created by user on 2019/6/1.
 */
const rule_1 = require("./rule");
const cloneDeep = require("lodash.clonedeep");
const _config = {
    plugins: ["@bluelovers"],
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
const recommended = cloneDeep(_config);
recommended.rules['@bluelovers/no-irregular-whitespace'] = [
    "error",
    {
        "skipComments": true,
        "skipStrings": false,
        "skipTemplates": false,
        "skipRegExps": false,
        "ignores": ['\u3000'],
    },
];
module.exports = {
    rules: rule_1.default,
    configs: {
        all: cloneDeep(_config),
        base: cloneDeep(_config),
        recommended,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFFSCxpQ0FBMkI7QUFJM0IsOENBQStDO0FBRS9DLE1BQU0sT0FBTyxHQUFHO0lBQ2YsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO0lBRXhCLEtBQUssRUFBRTtRQUNOLGFBQWE7UUFDYix5QkFBeUIsRUFBRTtZQUMxQixLQUFLO1lBQ0w7Z0JBQ0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixlQUFlLEVBQUUsS0FBSztnQkFDdEIsYUFBYSxFQUFFLEtBQUs7YUFDUjtTQUNiO1FBQ0QscUNBQXFDLEVBQUU7WUFDdEMsT0FBTztZQUNQO2dCQUNDLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixhQUFhLEVBQUUsS0FBSztnQkFDcEIsZUFBZSxFQUFFLEtBQUs7Z0JBQ3RCLGFBQWEsRUFBRSxLQUFLO2FBQ1I7U0FDYjtLQUNEO0NBQ0QsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFtQixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkQsV0FBVyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHO0lBQzFELE9BQU87SUFDUDtRQUNDLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLGFBQWEsRUFBRSxLQUFLO1FBQ3BCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGFBQWEsRUFBRSxLQUFLO1FBQ3BCLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQztLQUNyQjtDQUNELENBQUM7QUFFRixpQkFBUztJQUVSLEtBQUssRUFBTCxjQUFLO0lBRUwsT0FBTyxFQUFFO1FBQ1IsR0FBRyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQW1CO1FBQ3pDLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFtQjtRQUMxQyxXQUFXO0tBQ1g7Q0FFRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS82LzEuXG4gKi9cblxuaW1wb3J0IHJ1bGVzIGZyb20gJy4vcnVsZSc7XG5pbXBvcnQgZXNsaW50cmNKc29uID0gcmVxdWlyZSgnZXNsaW50LWNvbmZpZy1ibHVlbG92ZXJzJyk7XG5pbXBvcnQgeyBJT3B0aW9ucyB9IGZyb20gJy4vcnVsZS9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZSc7XG5cbmltcG9ydCBjbG9uZURlZXAgPSByZXF1aXJlKCdsb2Rhc2guY2xvbmVkZWVwJyk7XG5cbmNvbnN0IF9jb25maWcgPSB7XG5cdHBsdWdpbnM6IFtcIkBibHVlbG92ZXJzXCJdLFxuXG5cdHJ1bGVzOiB7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFwibm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIjogW1xuXHRcdFx0XCJvZmZcIixcblx0XHRcdHtcblx0XHRcdFx0XCJza2lwQ29tbWVudHNcIjogdHJ1ZSxcblx0XHRcdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcdFx0XCJza2lwVGVtcGxhdGVzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBSZWdFeHBzXCI6IGZhbHNlLFxuXHRcdFx0fSBhcyBJT3B0aW9ucyxcblx0XHRdLFxuXHRcdFwiQGJsdWVsb3ZlcnMvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2VcIjogW1xuXHRcdFx0XCJlcnJvclwiLFxuXHRcdFx0e1xuXHRcdFx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFx0XHRcInNraXBTdHJpbmdzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XHR9IGFzIElPcHRpb25zLFxuXHRcdF1cblx0fSxcbn07XG5cbmNvbnN0IHJlY29tbWVuZGVkOiB0eXBlb2YgX2NvbmZpZyA9IGNsb25lRGVlcChfY29uZmlnKTtcblxucmVjb21tZW5kZWQucnVsZXNbJ0BibHVlbG92ZXJzL25vLWlycmVndWxhci13aGl0ZXNwYWNlJ10gPSBbXG5cdFwiZXJyb3JcIixcblx0e1xuXHRcdFwic2tpcENvbW1lbnRzXCI6IHRydWUsXG5cdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcInNraXBUZW1wbGF0ZXNcIjogZmFsc2UsXG5cdFx0XCJza2lwUmVnRXhwc1wiOiBmYWxzZSxcblx0XHRcImlnbm9yZXNcIjogWydcXHUzMDAwJ10sXG5cdH0sXG5dO1xuXG5leHBvcnQgPSB7XG5cblx0cnVsZXMsXG5cblx0Y29uZmlnczoge1xuXHRcdGFsbDogY2xvbmVEZWVwKF9jb25maWcpIGFzIHR5cGVvZiBfY29uZmlnLFxuXHRcdGJhc2U6IGNsb25lRGVlcChfY29uZmlnKSBhcyB0eXBlb2YgX2NvbmZpZyxcblx0XHRyZWNvbW1lbmRlZCxcblx0fSxcblxufTtcbiJdfQ==