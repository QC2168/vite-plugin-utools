import { build } from 'vite'
import type { Plugin } from 'vite'
import { generateCfg, withExternalBuiltins } from './utils'
import type { OptionsType } from './types'
import buildUpx from './upx'
import { injectToJson, resolveServerUrl } from './injectDev'

export * from './types'
export { install } from './install'

export default function utools(options: OptionsType): Plugin[] {
  const { entry, hmr = false } = options
  const buildFileOptionsArr = Array.isArray(entry) ? entry : [entry]
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
      })
    },

  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    async closeBundle() {
      for await (const { entry, vite, mode } of buildFileOptionsArr)
        await build(withExternalBuiltins(generateCfg({ entry, vite }), mode))
      if (options?.upx)
        buildUpx(options.upx)
    },
  }]
}
