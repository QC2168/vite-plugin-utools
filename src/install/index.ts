import spawn from 'cross-spawn'
import colors from 'picocolors'
import { createLogger } from 'vite'
import getDependencies from './getDependencies'

const logger = createLogger()
const defaultFilePath = ['./dist/preload.js']

export async function install(paths = defaultFilePath, cwd = './dist') {
  try {
    logger.info(colors.blue('提取第三方依赖包'))

    const allPkgs = paths.reduce((pkgs: string[], path) => [...pkgs, ...getDependencies(path)], [])

    const uniquePkgs = Array.from(new Set(allPkgs))

    await spawn.sync('npm', ['init', '-y'], { cwd })

    logger.info(colors.blue(`提取成功:${uniquePkgs.join(',')}`))
    logger.info(colors.blue(`总共${uniquePkgs.length}个依赖包`))
    logger.info(colors.blue('正在安装...'))

    await spawn.sync('npm', ['install', '--production', ...uniquePkgs], { cwd })

    logger.info(colors.green('安装成功'))
  }
  catch (error: any) {
    logger.error(error.message)
  }
}
