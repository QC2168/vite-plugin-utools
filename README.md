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
    utools([ { entry: './utools/main.js' }])
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

## Options Type

```typescript
export interface OptionsType {
  entry: string
  vite: InlineConfig
}
```

## Example

[utools-plugin-template](https://github.com/QC2168/utools-plugin-template)