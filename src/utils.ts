import type { InlineConfig } from 'vite'
import type { BuildFileType } from './types'
import { builtinModules } from 'node:module'
import { join } from 'node:path'
import propcess from 'node:process'
import fs from 'fs-extra'
import JSON5 from 'json5'
import { mergeConfig } from 'vite'
import { BuildMode } from './types'

const cwd = propcess.cwd()

const { existsSync, readJSONSync } = fs
export function withExternalBuiltins(config: InlineConfig, mode = BuildMode.IncludeDependencies) {
  const builtins = builtinModules.filter(e => !e.startsWith('_'))
  builtins.push('electron', ...builtins.map(m => `node:${m}`))
  if (existsSync('./package.json') && mode === BuildMode.ExcludeDependencies) {
    const pkg = readJSONSync('./package.json')
    builtins.push(...Object.keys(pkg.dependencies))
  }
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

export function generateCfg({ entry, vite = {} }: BuildFileType) {
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

export function handlePluginJson(outDir: string) {
  fs.ensureDirSync(outDir)
  const isJSON5 = fs.existsSync(join(cwd, 'plugin.json5'))
  if (isJSON5) {
    // parse json5
    const json5 = fs.readFileSync(join(cwd, 'plugin.json5'), 'utf-8')
    const json = JSON5.parse(json5)
    fs.writeJSONSync(join(cwd, outDir, 'plugin.json'), json)
  }
  else {
    fs.copyFileSync(join(cwd, 'plugin.json'), join(cwd, outDir, 'plugin.json'))
  }
}

export function getPluginJsonPath(hmr: boolean | { pluginJsonPath?: string }) {
  const findPluginJson = () => {
    const paths = [
      join(cwd, 'plugin.json5'),
      join(cwd, 'plugin.json'),
    ]
    return paths.find(fs.existsSync)
  }

  if (typeof hmr === 'boolean') {
    const path = findPluginJson()
    if (!path)
      throw new Error('找不到 plugin.json 或 plugin.json5 文件')
    return path
  }

  const { pluginJsonPath } = hmr
  if (!pluginJsonPath)
    throw new Error('请指定 pluginJsonPath')
  if (!fs.existsSync(pluginJsonPath))
    throw new Error(`找不到配置文件: ${pluginJsonPath}`)

  return pluginJsonPath
}
