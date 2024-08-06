import { isAbsolute, join, resolve } from 'node:path'
import type { AddressInfo } from 'node:net'
import fs from 'fs-extra'
import type { UserConfig, ViteDevServer } from 'vite'
import type { BuildJsonType } from './types'

const { ensureDirSync, pathExistsSync, readJsonSync, writeJSONSync } = fs

// eslint-disable-next-line node/prefer-global/process
const cwd = process.cwd()

/**
 * @see https://github.com/vitejs/vite/blob/v4.0.1/packages/vite/src/node/constants.ts#L137-L147
 */
export function resolveHostname(hostname: string) {
  const loopbackHosts = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    '0000:0000:0000:0000:0000:0000:0000:0001',
  ])
  const wildcardHosts = new Set([
    '0.0.0.0',
    '::',
    '0000:0000:0000:0000:0000:0000:0000:0000',
  ])

  return loopbackHosts.has(hostname) || wildcardHosts.has(hostname) ? 'localhost' : hostname
}

export function resolveServerUrl(server: ViteDevServer): string | void {
  const addressInfo = server.httpServer!.address()
  const isAddressInfo = (x: any): x is AddressInfo => x?.address

  if (isAddressInfo(addressInfo)) {
    const { address, port } = addressInfo
    const hostname = resolveHostname(address)

    const options = server.config.server
    const protocol = options.https ? 'https' : 'http'
    const devBase = server.config.base

    const path = typeof options.open === 'string' ? options.open : devBase
    const url = path.startsWith('http')
      ? path
      : `${protocol}://${hostname}:${port}${path}`

    return url
  }
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
