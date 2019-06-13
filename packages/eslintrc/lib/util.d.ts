/**
 * Created by user on 2019/6/14.
 */
export declare function addTsconfig(eslintrcJson: Partial<{
    parserOptions?: Record<string, any> & {
        project?: string;
        parser?: string;
    };
}>, options?: {
    cwd?: string;
    overwrite?: boolean;
}): Partial<{
    parserOptions?: Record<string, any> & {
        project?: string;
        parser?: string;
    };
}>;
