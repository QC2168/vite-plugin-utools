import { type Plugin, build } from 'vite'
import { generateCfg, withExternalBuiltins } from './utils'
import type { OptionsType } from './types'

export default function utools(options: OptionsType | OptionsType[]): Plugin[] {
  const optionsArr = Array.isArray(options) ? options : [options]
  return [{
    name: 'vite-plugin-utools',
    apply: 'serve',
    buildStart() {
      for (const options of optionsArr)
        build(withExternalBuiltins(generateCfg(options)))
    },
  }, {
    name: 'vite-plugin-utools',
    apply: 'build',
    closeBundle() {
      for (const options of optionsArr)
        build(withExternalBuiltins(generateCfg(options)))
    },
  }]
}
