# vite-plugin-utools

Easier to develop utools plugin

## Usage

Install the plugin

```bash
npm i @qc2168/vite-plugin-utools -D
```

In the vite config file, add the vite-plugin-utools

```typescript
// vite.config.ts
plugins: [
  utools({ entry: [
    { entry: 'utools/main.ts' },
    { entry: 'utools/preload.ts' }
  ] })
]
```

Create a `main.js` file and pass the file path to plugin

```javascript
// main.js
window.exports = {
  // plugin entrance
  demo: {
    mode: 'none',
    args: {
      enter: async () => {
        // some things
      }
    }
  }
}
```

### HMR Inject

You can using auto inject `development.main`, to achieve hot updates

```typescript
utools({
  hmr: {
    pluginJsonPath: 'your plugin.json path'
  }
})
```

## Options Type

```typescript
import type { InlineConfig } from 'vite'

export enum BuildMode { IncludeDependencies, ExcludeDependencies }

export interface BuildFileType {
  entry: string | string[]
  vite?: InlineConfig
  mode?: BuildMode
}

export interface BuildJsonType {
  outdir?: string
  entry: string
  address: string
}

export interface OptionsType {
  entry: BuildFileType | BuildFileType[]
  hmr?: boolean | { pluginJsonPath?: string }
}
```

## Example

[utools-plugin-template](https://github.com/QC2168/utools-plugin-template)
