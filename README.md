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
    utools({ entry: ['./utools/main.js'] })
  ]
```

Create a `main.js` file and pass the file path to plugin

```javascript
// main.js
window.exports = {
    // plugin entrance
    "demo": {
        mode: "none",
        args: {
            enter: async () => {
                // some things
            }
        }
    }
}
```

### Upx Build

By default, upx is not built, if you want to build, you just need to set up the upx object

```typescript
// vite.config.ts
  plugins: [
    utools({
      entry: ['./utools/main.js'],
      upx: {pluginJsonPath:'your plugin.json path'}
    })
  ]
```

### HMR Inject

You can using auto inject `development.main`, to achieve hot updates

```typescript
utools({
  hmr: {
    pluginJsonPath: 'your plugin.json path'
  }})
```

## Options Type

```typescript
interface UpxBuildType {
    entry?: string;
    pluginJsonPath: string;
    outDir?: string;
    packageName?: string;
}

interface BuildFileType {
    entry: string | string[];
    vite?: InlineConfig;
}

interface OptionsType {
    entry: BuildFileType | BuildFileType[];
    upx?: false | UpxBuildType;
    hmr?: false | {
        pluginJsonPath?: string;
    };
}
```

## Example

[utools-plugin-template](https://github.com/QC2168/utools-plugin-template)