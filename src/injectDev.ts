import type { AddressInfo } from 'node:net'
import type { ViteDevServer } from 'vite'
import type { BuildJsonType } from './types'
import { isAbsolute, join, resolve } from 'node:path'
import fs from 'fs-extra'
import JSON5 from 'json5'

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
  // check entry path
  const entryPath = isAbsolute(entry) ? entry : resolve(cwd, entry)

  // check file exists
  if (!pathExistsSync(entryPath)) {
    throw new Error(`找不到配置文件，请检查 ${entry}`)
  }

  // ensure outdir exists
  ensureDirSync(outdir)

  let pluginJSONValue: any

  try {
    // check if entry is json5
    const isJSON5 = entryPath.endsWith('.json5')

    if (isJSON5) {
      const json5Content = fs.readFileSync(entryPath, 'utf-8')
      pluginJSONValue = JSON5.parse(json5Content)
    }
    else {
      pluginJSONValue = readJsonSync(entryPath, 'utf-8')
    }

    // inject development config
    pluginJSONValue.development = {
      main: address,
    }

    // write to outdir
    const outputPath = join(cwd, outdir, 'plugin.json')
    writeJSONSync(outputPath, pluginJSONValue, { spaces: 2 })
  }
  catch (error) {
    throw new Error(`处理配置文件失败: ${(error as Error).message}`)
  }
}
