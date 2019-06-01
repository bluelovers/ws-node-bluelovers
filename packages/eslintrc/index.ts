/**
 * Created by user on 2019/5/18.
 */

import EslintrcJson = require('./.eslintrc.json');
import { findTsconfig } from '@yarn-tool/find-tsconfig';

const eslintrcJson = {
	...EslintrcJson,

	/*
	rules: Object.assign({
		...EslintrcJson.rules,
	}, {
		'@bluelovers/no-irregular-whitespace': noIrregularWhitespace,
	})
	 */
};

delete eslintrcJson.parserOptions.project;

if (!eslintrcJson.parserOptions.project)
{
	let file = findTsconfig(process.cwd());

	if (file)
	{
		eslintrcJson.parserOptions.project = file;
	}
}

export = eslintrcJson;
