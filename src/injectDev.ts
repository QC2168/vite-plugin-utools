import { isAbsolute, join, resolve } from 'node:path'
import { ensureDirSync, pathExistsSync, readJsonSync, writeJSONSync } from 'fs-extra'
import type { UserConfig } from 'vite'
import type { BuildJsonType } from './types'

// eslint-disable-next-line node/prefer-global/process
const cwd = process.cwd()
export function obtainServerAddress(server: UserConfig['server']) {
  const { host = null, port = null } = server || {}
  if (!host || !port)
    throw new Error('请检查手动提供vite.serve.host和vite.serve.port')

  return `http://${host}:${port}`
}

export function injectToJson({ entry, outdir = 'dist', address }: BuildJsonType) {
  if (!pathExistsSync(entry))
    throw new Error(`plugin.json不存在，请检查${entry}`)

  ensureDirSync(outdir)

  const requirePath = isAbsolute(entry) ? entry : resolve(cwd, entry)

  const pluginValue = readJsonSync(requirePath, 'utf-8')
  pluginValue.development = {
    main: address,
  }
  writeJSONSync(join(cwd, outdir, 'plugin.json'), pluginValue)
}
