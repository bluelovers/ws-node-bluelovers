"use strict";
/**
 * Created by user on 2019/5/18.
 */
const EslintrcJson = require("./.eslintrc.json");
const TsconfigLib = require("tsconfig");
const eslintrcJson = {
    ...EslintrcJson,
};
eslintrcJson.parserOptions.project = TsconfigLib.resolveSync(process.cwd());
module.exports = eslintrcJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7QUFFSCxpREFBa0Q7QUFDbEQsd0NBQXlDO0FBRXpDLE1BQU0sWUFBWSxHQUFHO0lBQ3BCLEdBQUcsWUFBWTtDQUNmLENBQUM7QUFFRixZQUFZLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBVyxDQUFDO0FBRXRGLGlCQUFTLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8xOC5cbiAqL1xuXG5pbXBvcnQgRXNsaW50cmNKc29uID0gcmVxdWlyZSgnLi8uZXNsaW50cmMuanNvbicpO1xuaW1wb3J0IFRzY29uZmlnTGliID0gcmVxdWlyZSgndHNjb25maWcnKTtcblxuY29uc3QgZXNsaW50cmNKc29uID0ge1xuXHQuLi5Fc2xpbnRyY0pzb24sXG59O1xuXG5lc2xpbnRyY0pzb24ucGFyc2VyT3B0aW9ucy5wcm9qZWN0ID0gVHNjb25maWdMaWIucmVzb2x2ZVN5bmMocHJvY2Vzcy5jd2QoKSkgYXMgc3RyaW5nO1xuXG5leHBvcnQgPSBlc2xpbnRyY0pzb247XG4iXX0=