import { build } from 'vite'
import type { Plugin } from 'vite'
import { generateCfg, withExternalBuiltins } from './utils'
import type { OptionsType } from './types'
import buildUpx from './upx'
import { injectToJson, resolveServerUrl } from './injectDev'

export default function utools(options: OptionsType): Plugin[] {
  const buildFileOptionsArr = Array.isArray(options.entry) ? options.entry : [options.entry]
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

        if (options?.hmr && options?.hmr.pluginJsonPath) {
          const pluginJsonPath = options.hmr.pluginJsonPath
          const address = resolveServerUrl(server)
          address && injectToJson({ entry: pluginJsonPath, outdir: server.config.build?.outDir, address })
        }
      })
    },

  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    async closeBundle() {
      for await (const { entry, vite } of buildFileOptionsArr)
        await build(withExternalBuiltins(generateCfg({ entry, vite })))
      if (options?.upx)
        buildUpx(options.upx)
    },
  }]
}
