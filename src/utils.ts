import type { InlineConfig } from 'vite'
import { mergeConfig } from 'vite'
import type { OptionsType } from './types'

export function generateCfg({ entry, vite = {} }: OptionsType) {
  const defaultCfg = {
    configFile: false,
    build: {
      lib: {
        entry,
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
      rollupOptions: {
        external: ['electron'],
      },
      outDir: 'dist',
      emptyOutDir: false,
      minify: false,
    },
    resolve: {
      browserField: false,
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  } as InlineConfig
  return mergeConfig(defaultCfg, vite)
}
