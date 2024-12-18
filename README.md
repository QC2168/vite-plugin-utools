# vite-plugin-utools 🚀🛠️

这是一款基于`Vite`开发的插件，可以帮助开发者更方便地构建`Utools`插件。

## 解决痛点

- [x]  编译`preload`文件，开发时可使用`typescript`，`esm`语法进行开发 💻
- [x]  开发环境下，自动注入`development.main`，实现`utools`插件热更新 🔥
- [x]  开发环境下preload自动捆绑第三方依赖，打包utools插件时，将第三方依赖打包进`utools`插件中 📦

## 快速上手 🏃‍♂️

您可以直接使用`utools-plugin-template`作为模板项目，快速开始开发

无需手动安装插件并配置插件选项，更简单更方便

[点击前往 utools-plugin-template](https://github.com/QC2168/utools-plugin-template)

## 使用说明 📝

在您的插件项目中安装插件

> ⚠️ 该插件只能在`vite`项目中使用，非`vite`项目中无法兼容

```bash
npm i @qc2168/vite-plugin-utools -D
```

在`vite.config.ts`中引入该插件，并填写`preload`文件的入口

```typescript
// vite.config.ts
plugins: [
  utools({ entry: [
    // 你的preload文件，可以是一个文件，也可以是一个数组，支持多入口
    { entry: 'utools/main.ts' },
    { entry: 'utools/preload.ts' }
  ] })
]
```

### 热更新注入 🔁

当启用项目时，插件会检测当前环境，如果是`dev`模式，插件将自动往`plugin.json`中注入 `development.main`，注入的值为当前服务的地址

```typescript
utools({
  hmr: {
    pluginJsonPath: 'your plugin.json path'
  }
})
```

### 第三方依赖安装实现 📦

当插件打包完毕后，我们需要写一个小脚本，调用插件中的`install`方法，对`preload`文件中的依赖进行提取和安装，省去了我们手动的操作

```javascript
import { install } from '@qc2168/vite-plugin-utools'

install(['./dist/preload.js'], {
  dependenciesOptions: {
    rootPackage: {
      path: './package.json'
    }
  }
})
```

- dependenciesOptions.rootPackage.path
  - 可选参数，这个选项帮助我们安装特定版本的依赖包。通常，install 会自动安装所有最新的依赖版本。但有时候，我们需要使用旧版本的依赖（比如 foo 需要 1.0.0 版本，而不是最新的 1.5.1）。通过设置这个参数并指向项目的 package.json 文件，我们可以确保 install 安装的是 package.json 中指定的版本，而不是最新版本。这样可以保证项目按预期工作。
- cwd
  - 可选参数，指定安装依赖的工作目录。如果不指定，默认使用当前工作目录下的`dist`文件夹。
- deps
  - 可选参数，添加特定的依赖包名 （包名不能和`rootPackage.path`中的依赖冲突）。

## 选项参数类型 🛠️

```typescript
import { InlineConfig, Plugin } from 'vite'

declare enum BuildMode {
  IncludeDependencies = 0,
  ExcludeDependencies = 1
}
interface BuildFileType {
  entry: string | string[]
  vite?: InlineConfig
  mode?: BuildMode
}
interface BuildJsonType {
  outdir?: string
  entry: string
  address: string
}
interface OptionsType {
  entry: BuildFileType | BuildFileType[]
  hmr?: boolean | {
    pluginJsonPath?: string
  }
}

interface GetDependenciesOptions {
  deps?: string[]
  rootPackage?: {
    path: string
  } | null
}

interface InstallOptionsType {
  cwd: string
  dependenciesOptions: GetDependenciesOptions
}
declare function install(paths?: string[], options?: InstallOptionsType): Promise<void>

declare function utools(options: OptionsType): Plugin[]

export { type BuildFileType, type BuildJsonType, BuildMode, utools as default, install, type OptionsType }
```
