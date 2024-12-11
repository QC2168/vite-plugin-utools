import type { Plugin, ResolvedConfig } from 'vite'
import type { OptionsType } from './types'
import { join } from 'node:path'
import { cwd } from 'node:process'
import fs from 'fs-extra'
import { build } from 'vite'
import { injectToJson, resolveServerUrl } from './injectDev'
import buildUpx from './upx'
import { generateCfg, withExternalBuiltins } from './utils'

export { install } from './install'
export * from './types'

export default function utools(options: OptionsType): Plugin[] {
  const { entry, hmr = false } = options
  const buildFileOptionsArr = Array.isArray(entry) ? entry : [entry]
  let config: ResolvedConfig
  return [{
    name: 'vite-plugin-utools',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('listening', async () => {
        for await (const { entry, vite = {} } of buildFileOptionsArr) {
          vite.build ??= {}
          // watch only the entry file
          vite.build.watch = {
            include: entry,
          }
          await build(withExternalBuiltins(generateCfg({ entry, vite })))
        }

        if (hmr && hmr.pluginJsonPath) {
          const pluginJsonPath = hmr.pluginJsonPath
          const address = resolveServerUrl(server)
          address && injectToJson({ entry: pluginJsonPath, outdir: server.config.build?.outDir, address })
        }
        else {
          // move the plugin.json to dist
          fs.copyFileSync(join(cwd(), 'plugin.json'), join(cwd(), server.config.build?.outDir ?? 'dist', 'plugin.json'))
        }
      })
    },

  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    configResolved(cfg: ResolvedConfig) {
      config = cfg
    },
    async closeBundle() {
      for await (const { entry, vite, mode } of buildFileOptionsArr)
        await build(withExternalBuiltins(generateCfg({ entry, vite }), mode))

      fs.copyFileSync(join(cwd(), 'plugin.json'), join(cwd(), config.build?.outDir ?? 'dist', 'plugin.json'))
      if (options?.upx)
        buildUpx(options.upx)
    },
  }]
}
