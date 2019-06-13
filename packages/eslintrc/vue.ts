/**
 * Created by user on 2019/6/14.
 */

import EslintrcJson = require('./vue/.eslintrc.json');
import { addTsconfig } from './lib/util';

const eslintrcJson = {
	...EslintrcJson,
};

addTsconfig(eslintrcJson, {
	overwrite: true,
});

export = eslintrcJson;
