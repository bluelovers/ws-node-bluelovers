/**
 * Created by user on 2019/5/18.
 */

import EslintrcJson = require('./.eslintrc.json');
import TsconfigLib = require('tsconfig');

const eslintrcJson = {
	...EslintrcJson,
};

eslintrcJson.parserOptions.project = TsconfigLib.resolveSync(process.cwd()) as string;

export = eslintrcJson;
