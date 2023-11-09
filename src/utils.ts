import { builtinModules } from 'node:module'
import type { InlineConfig } from 'vite'
import { mergeConfig } from 'vite'
import type { OptionsType } from './types'

export function withExternalBuiltins(config: InlineConfig) {
  const builtins = builtinModules.filter(e => !e.startsWith('_'))
  builtins.push('electron', ...builtins.map(m => `node:${m}`))

  config.build ??= {}
  config.build.rollupOptions ??= {}

  let external = config.build.rollupOptions.external
  if (
    Array.isArray(external)
    || typeof external === 'string'
    || external instanceof RegExp
  ) {
    external = builtins.concat(external as string[])
  }
  else if (typeof external === 'function') {
    const original = external
    external = function (source, importer, isResolved) {
      if (builtins.includes(source))
        return true

      return original(source, importer, isResolved)
    }
  }
  else {
    external = builtins
  }
  config.build.rollupOptions.external = external

  return config
}

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
