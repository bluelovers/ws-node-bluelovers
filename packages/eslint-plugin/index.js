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
        disable: {
            rules: {
                "@bluelovers/no-irregular-whitespace": "off",
            }
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFFSCxpQ0FBMkI7QUFJM0IsOENBQStDO0FBRS9DLE1BQU0sT0FBTyxHQUFHO0lBQ2YsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO0lBRXhCLEtBQUssRUFBRTtRQUNOLGFBQWE7UUFDYix5QkFBeUIsRUFBRTtZQUMxQixLQUFLO1lBQ0w7Z0JBQ0MsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGFBQWEsRUFBRSxLQUFLO2dCQUNwQixlQUFlLEVBQUUsS0FBSztnQkFDdEIsYUFBYSxFQUFFLEtBQUs7YUFDUjtTQUNiO1FBQ0QscUNBQXFDLEVBQUU7WUFDdEMsT0FBTztZQUNQO2dCQUNDLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixhQUFhLEVBQUUsS0FBSztnQkFDcEIsZUFBZSxFQUFFLEtBQUs7Z0JBQ3RCLGFBQWEsRUFBRSxLQUFLO2FBQ1I7U0FDYjtLQUNEO0NBQ0QsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFtQixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkQsV0FBVyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHO0lBQzFELE9BQU87SUFDUDtRQUNDLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLGFBQWEsRUFBRSxLQUFLO1FBQ3BCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGFBQWEsRUFBRSxLQUFLO1FBQ3BCLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQztLQUNyQjtDQUNELENBQUM7QUFFRixpQkFBUztJQUVSLEtBQUssRUFBTCxjQUFLO0lBRUwsT0FBTyxFQUFFO1FBQ1IsR0FBRyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQW1CO1FBQ3pDLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFtQjtRQUMxQyxXQUFXO1FBQ1gsT0FBTyxFQUFFO1lBQ1IsS0FBSyxFQUFFO2dCQUNOLHFDQUFxQyxFQUFFLEtBQUs7YUFDNUM7U0FDRDtLQUNEO0NBRUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNi8xLlxuICovXG5cbmltcG9ydCBydWxlcyBmcm9tICcuL3J1bGUnO1xuaW1wb3J0IGVzbGludHJjSnNvbiA9IHJlcXVpcmUoJ2VzbGludC1jb25maWctYmx1ZWxvdmVycycpO1xuaW1wb3J0IHsgSU9wdGlvbnMgfSBmcm9tICcuL3J1bGUvbm8taXJyZWd1bGFyLXdoaXRlc3BhY2UnO1xuXG5pbXBvcnQgY2xvbmVEZWVwID0gcmVxdWlyZSgnbG9kYXNoLmNsb25lZGVlcCcpO1xuXG5jb25zdCBfY29uZmlnID0ge1xuXHRwbHVnaW5zOiBbXCJAYmx1ZWxvdmVyc1wiXSxcblxuXHRydWxlczoge1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcIm5vLWlycmVndWxhci13aGl0ZXNwYWNlXCI6IFtcblx0XHRcdFwib2ZmXCIsXG5cdFx0XHR7XG5cdFx0XHRcdFwic2tpcENvbW1lbnRzXCI6IHRydWUsXG5cdFx0XHRcdFwic2tpcFN0cmluZ3NcIjogZmFsc2UsXG5cdFx0XHRcdFwic2tpcFRlbXBsYXRlc1wiOiBmYWxzZSxcblx0XHRcdFx0XCJza2lwUmVnRXhwc1wiOiBmYWxzZSxcblx0XHRcdH0gYXMgSU9wdGlvbnMsXG5cdFx0XSxcblx0XHRcIkBibHVlbG92ZXJzL25vLWlycmVndWxhci13aGl0ZXNwYWNlXCI6IFtcblx0XHRcdFwiZXJyb3JcIixcblx0XHRcdHtcblx0XHRcdFx0XCJza2lwQ29tbWVudHNcIjogdHJ1ZSxcblx0XHRcdFx0XCJza2lwU3RyaW5nc1wiOiBmYWxzZSxcblx0XHRcdFx0XCJza2lwVGVtcGxhdGVzXCI6IGZhbHNlLFxuXHRcdFx0XHRcInNraXBSZWdFeHBzXCI6IGZhbHNlLFxuXHRcdFx0fSBhcyBJT3B0aW9ucyxcblx0XHRdXG5cdH0sXG59O1xuXG5jb25zdCByZWNvbW1lbmRlZDogdHlwZW9mIF9jb25maWcgPSBjbG9uZURlZXAoX2NvbmZpZyk7XG5cbnJlY29tbWVuZGVkLnJ1bGVzWydAYmx1ZWxvdmVycy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZSddID0gW1xuXHRcImVycm9yXCIsXG5cdHtcblx0XHRcInNraXBDb21tZW50c1wiOiB0cnVlLFxuXHRcdFwic2tpcFN0cmluZ3NcIjogZmFsc2UsXG5cdFx0XCJza2lwVGVtcGxhdGVzXCI6IGZhbHNlLFxuXHRcdFwic2tpcFJlZ0V4cHNcIjogZmFsc2UsXG5cdFx0XCJpZ25vcmVzXCI6IFsnXFx1MzAwMCddLFxuXHR9LFxuXTtcblxuZXhwb3J0ID0ge1xuXG5cdHJ1bGVzLFxuXG5cdGNvbmZpZ3M6IHtcblx0XHRhbGw6IGNsb25lRGVlcChfY29uZmlnKSBhcyB0eXBlb2YgX2NvbmZpZyxcblx0XHRiYXNlOiBjbG9uZURlZXAoX2NvbmZpZykgYXMgdHlwZW9mIF9jb25maWcsXG5cdFx0cmVjb21tZW5kZWQsXG5cdFx0ZGlzYWJsZToge1xuXHRcdFx0cnVsZXM6IHtcblx0XHRcdFx0XCJAYmx1ZWxvdmVycy9uby1pcnJlZ3VsYXItd2hpdGVzcGFjZVwiOiBcIm9mZlwiLFxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxufTtcbiJdfQ==