# @bluelovers/tsconfig

    用於 TypeScript 項目的基礎 tsconfig 配置預設 (Base tsconfig preset for TypeScript projects)

```
npm install @bluelovers/tsconfig
```

## 安裝 (Installation)

```bash
# 使用 yarn / Using yarn
yarn add @bluelovers/tsconfig

# 使用 yarn-tool / Using yarn-tool
yarn-tool add @bluelovers/tsconfig
# yt 是 yarn-tool 的別名 / yt is an alias for yarn-tool
yt add @bluelovers/tsconfig

# 使用 pnpm / Using pnpm
pnpm add @bluelovers/tsconfig

# 使用 npm / Using npm
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

## docs

- [TypeScript - Non-Null Assertion Operator !](https://www.logicbig.com/tutorials/misc/typescript/non-null-assertion-operator.html)
- [TypeScript - Using --noImplicitThis flag](https://www.logicbig.com/tutorials/misc/typescript/no-implicit-this.html)
- 

