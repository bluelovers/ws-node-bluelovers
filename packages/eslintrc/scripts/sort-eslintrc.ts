/**
 * Created by user on 2019/5/29.
 */

import EslintrcJson = require('../.eslintrc.json');
import sortObject = require('sort-object-keys2');
import fs = require('fs');
import path = require('path');

// @ts-ignore
EslintrcJson.rules = sortObject(EslintrcJson.rules, {
	keys: orderTweak(Object.keys(EslintrcJson.rules).sort().sort(function (a, b)
	{
		// @ts-ignore
		let i1 = a.startsWith('@') | 0;
		// @ts-ignore
		let i2 = b.startsWith('@') | 0;

		let r = i1 - i2;

		return r
	}), [

		['semi', '@typescript-eslint/semi',],
		['no-extra-parens', '@typescript-eslint/no-extra-parens',],
		['func-call-spacing', '@typescript-eslint/func-call-spacing',],
		['indent', '@typescript-eslint/indent',],
		['no-magic-numbers', '@typescript-eslint/no-magic-numbers',],
		['camelcase', '@typescript-eslint/camelcase',],
		['no-unused-vars', '@typescript-eslint/no-unused-vars',],
		['no-use-before-define', '@typescript-eslint/no-use-before-define',],

	], true),
});

let json = JSON.stringify(EslintrcJson, null, 2);

fs.writeFileSync(path.join(__dirname, '..', '.eslintrc.json'), json);

export function orderTweak<T extends string>(keys: T[], groups: (T | string)[][], mode?: boolean)
{
	let ret = keys.slice();

	mode = !!mode;

	groups.forEach(ls => {
		if (ls.length > 1)
		{
			ls.reduce((p: T, k: T) => {

				let pi = ret.indexOf(p);
				let ki = ret.indexOf(k);

				if (pi !== -1 && ki !== -1)
				{
					if (mode && ki > pi)
					{
						let ps = ret[pi];

						ret.splice(ki, 0, ps);
						ret.splice(pi, 1);
					}
					else if (!mode && ki < pi)
					{
						let pa = ret.splice(pi, 1);
						ret.splice(ki, 0, ...pa)
					}
				}

				return k;
			})
		}
	});

	return ret;
}


