/**
 * Created by user on 2019/5/18.
 */

import EslintrcJson = require('./.eslintrc.json');
import { findTsconfig } from '@yarn-tool/find-tsconfig';
import { addTsconfig } from './lib/util';

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

addTsconfig(eslintrcJson, {
	overwrite: true,
});

export = eslintrcJson;
