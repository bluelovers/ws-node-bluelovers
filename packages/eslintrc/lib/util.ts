/**
 * Created by user on 2019/6/14.
 */

import { findTsconfig } from '@yarn-tool/find-tsconfig';

export function addTsconfig(eslintrcJson:Partial<{
	parserOptions?: Record<string, any> & {
		project?: string,
		parser?: string,
	}
}>, options?: {
	cwd?: string,
	overwrite?: boolean,
})
{
	let { cwd = process.cwd(), overwrite } = options || {};

	if (overwrite || !eslintrcJson.parserOptions.project)
	{
		let file = findTsconfig(cwd);

		if (file)
		{
			eslintrcJson.parserOptions.project = file;
		}
	}

	return eslintrcJson
}
