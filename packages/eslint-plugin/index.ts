/**
 * Created by user on 2019/6/1.
 */

import rules from './rule';
import eslintrcJson = require('eslint-config-bluelovers');
import { IOptions } from './rule/no-irregular-whitespace';

import cloneDeep = require('lodash.clonedeep');

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
			} as IOptions,
		],
		"@bluelovers/no-irregular-whitespace": [
			"error",
			{
				"skipComments": true,
				"skipStrings": false,
				"skipTemplates": false,
				"skipRegExps": false,
			} as IOptions,
		]
	},
};

const recommended: typeof _config = cloneDeep(_config);

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

export = {

	rules,

	configs: {
		all: cloneDeep(_config) as typeof _config,
		base: cloneDeep(_config) as typeof _config,
		recommended,
		disable: {
			rules: {
				"@bluelovers/no-irregular-whitespace": "off",
			}
		}
	},

};
