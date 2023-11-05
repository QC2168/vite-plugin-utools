import { build } from 'vite'
import type { InlineConfig, Plugin } from 'vite'

function generateCfg(entry: string) {
  return {
    configFile: false,
    publicDir: false,
    build: {
      lib: {
        entry,
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
      outDir: 'dist/dist-utools',
      emptyOutDir: false,
      minify: false,
    },
    resolve: {
      browserField: false,
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  } as InlineConfig
}

export interface OptionsType {
  entry: string
}

export default function utools(options: OptionsType | OptionsType[]): Plugin[] {
  const optionsArr = Array.isArray(options) ? options : [options]
  return [{
    name: 'vite-plugin-utools',
    apply: 'serve',
    buildStart() {
      for (const options of optionsArr)
        build(generateCfg(options.entry))
    },
  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    closeBundle() {
      for (const options of optionsArr)
        build(generateCfg(options.entry))
    },
  }]
}
