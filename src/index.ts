import { type Plugin, build } from 'vite'
import { generateCfg, withExternalBuiltins } from './utils'
import type { OptionsType } from './types'
import buildUpx from './upx'

export default function utools(options: OptionsType): Plugin[] {
  const buildFileOptionsArr = Array.isArray(options.entry) ? options.entry : [options.entry]
  const buildFile = () => {
    for (const options of buildFileOptionsArr) {
      if (typeof options === 'string')
        build(withExternalBuiltins(generateCfg({ entry: options })))
      else
        build(withExternalBuiltins(generateCfg(options)))
    }
  }
  return [{
    name: 'vite-plugin-utools',
    apply: 'serve',
    buildStart() {
      buildFile()
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
