# @bluelovers/tsconfig

    my base tsconfig

```
npm install @bluelovers/tsconfig
```

[What's new in TypeScript](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript)

tsconfig.json inheritance via Node.js packages

```tsconfig.json
{
    "extends": "@bluelovers/tsconfig",
    "compilerOptions": {
        // Override certain options on a project-by-project basis.
        "strictBindCallApply": false,
    }
}
```
