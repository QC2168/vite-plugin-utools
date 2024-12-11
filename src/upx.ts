import type { UpxBuildType } from './types'
import { unlink } from 'node:fs/promises'
import { basename, isAbsolute, join, resolve as resolvePath } from 'node:path'
import { createGzip } from 'node:zlib'
import { createPackage } from '@electron/asar'
import fs from 'fs-extra'
import colors from 'picocolors'
import { createLogger } from 'vite'

const { copySync, createReadStream, createWriteStream, ensureDirSync, readFileSync } = fs
const logger = createLogger()
// eslint-disable-next-line node/prefer-global/process
const cwd = process.cwd()

const requiredKeys = [
  'name',
  'pluginName',
  'description',
  'author',
  'homepage',
  'version',
  'logo',
  'features',
] as const

const DOC_URL = 'https://www.u.tools/docs/developer/config.html#基本配置'
function validatePluginField(path: string) {
  const requirePath = isAbsolute(path) ? path : resolvePath(cwd, path)
  const values = JSON.parse(readFileSync(requirePath, 'utf-8'))
  requiredKeys.forEach((key) => {
    if (!values[key])
      throw new Error(colors.red(`构建失败：plugin.json ${key} 字段丢失 查阅文档: ${colors.bold(DOC_URL)}`))
  })
  return values
}

function replacePlaceholders(template: string, data: { [key: string]: string }): string {
  for (const key in data)
    template = template.replace(`[${key}]`, data[key])

  return template
}

const TEMPORARY_DEST = resolvePath(cwd, `./.utools_${Math.random()}`)

async function buildPkg(entry: string, output: string) {
  await createPackage(entry, TEMPORARY_DEST)
  const checkPkgName = !output.endsWith('.upx') ? `${output}.upx` : output
  await new Promise((resolve, reject) => createReadStream(TEMPORARY_DEST)
    .pipe(createGzip())
    .pipe(createWriteStream(checkPkgName))
    .on('error', reject)
    .on('finish', resolve),
  ).finally(() => unlink(TEMPORARY_DEST))
}

export async function buildUpx(option: UpxBuildType) {
  const { pluginJsonPath, packageName: optionPackageName, entry, outDir } = option
  const defaultPackageName = '[pluginName]_[version].upx'
  const defaultEntry = 'dist'
  const defaultOutDir = 'upx'

  const pluginFileObj = validatePluginField(pluginJsonPath)

  const packageName = replacePlaceholders(optionPackageName ?? defaultPackageName, pluginFileObj)
  const buildEntry = entry ?? defaultEntry
  // copy plugin.json to entry
  copySync(pluginJsonPath, join(buildEntry, basename(pluginJsonPath)))

  logger.info(colors.green('\n正在构建upx包....'))

  try {
    const actualOutDir = outDir ?? defaultOutDir
    ensureDirSync(actualOutDir)

    const packageFullPath = join(actualOutDir, packageName)
    await buildPkg(buildEntry, packageFullPath)

    logger.info(`${colors.green('✓')} 构建成功`)
    logger.info(colors.blue(packageFullPath))
  }
  catch (error: any) {
    logger.error(`${colors.red('构建失败:')}\n${error.stack || error.message}`)
  }
}

export default buildUpx
