/**
 * Created by user on 2019/6/2.
 */
import noIrregularWhitespace from '../../rule/no-irregular-whitespace';
import { RuleTester as _RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint/RuleTester';
//import { TSESLint } from '@typescript-eslint/experimental-utils';

// @ts-ignore
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester();

ruleTester.run(noIrregularWhitespace.name, noIrregularWhitespace, {
	valid: [
		' ',
		{
			code: '　',
			options: [
				{
					ignores: ['　'],
				},
			],
		} as any,
	],
	invalid: [
		{
			code: '　\f',
			errors: [
				{
					messageId: "noIrregularWhitespace",
				},
			],
		},
		{
			code: '　',
			errors: [
				{
					messageId: "noIrregularWhitespace",
				},
			],
		},
	],
});
