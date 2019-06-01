/**
 * Created by user on 2019/6/1.
 */

import rules from './rule';
import eslintrcJson = require('eslint-config-bluelovers');

const _config: Partial<typeof eslintrcJson> = {
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

export = {

	rules,

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
