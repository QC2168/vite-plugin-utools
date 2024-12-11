import type { Plugin, ResolvedConfig } from 'vite'
import type { OptionsType } from './types'
import { build } from 'vite'
import { injectToJson, resolveServerUrl } from './injectDev'
import { generateCfg, getPluginJsonPath, handlePluginJson, withExternalBuiltins } from './utils'

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

        if (hmr) {
          try {
            const pluginJsonPath = getPluginJsonPath(hmr)
            const address = resolveServerUrl(server)
            if (address && pluginJsonPath) {
              injectToJson({
                entry: pluginJsonPath,
                outdir: server.config.build?.outDir,
                address,
              })
            }
          }
          catch (error) {
            console.error(`HMR 配置错误: ${(error as Error).message}`)
          }
        }
        else {
          // move the plugin.json to dist
          handlePluginJson(server.config.build?.outDir ?? 'dist')
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
      // move plugin.json to dist
      handlePluginJson(config.build?.outDir ?? 'dist')
    },
  }]
}
