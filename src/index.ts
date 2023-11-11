import { build } from 'vite'
import type { InlineConfig, Plugin } from 'vite'
import { generateCfg, withExternalBuiltins } from './utils'
import type { OptionsType } from './types'
import buildUpx from './upx'
import { injectToJson, obtainServerAddress } from './injectDev'

export default function utools(options: OptionsType): Plugin[] {
  const buildFileOptionsArr = Array.isArray(options.entry) ? options.entry : [options.entry]
  const buildFile = async () => {
    for await (const options of buildFileOptionsArr) {
      if (typeof options === 'string')
        await build(withExternalBuiltins(generateCfg({ entry: options })))
      else
        await build(withExternalBuiltins(generateCfg(options)))
    }
  }

  let viteConfig: InlineConfig = {}
  return [{
    name: 'vite-plugin-utools',
    apply: 'serve',
    config(cfg) {
      viteConfig = cfg
    },

    async buildStart() {
      await buildFile()
      if (options?.hmr && options?.pluginJsonPath) {
        const address = obtainServerAddress(viteConfig.server)
        injectToJson({ entry: options.pluginJsonPath, outdir: viteConfig.build?.outDir, address })
      }
    },

  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    closeBundle() {
      buildFile()
      if (options?.upx)
        buildUpx(options.upx)
    },
  }]
}
