import { builtinModules } from 'node:module'
import spawn from 'cross-spawn'
import colors from 'picocolors'
import { createLogger } from 'vite'
import getDependencies from './getDependencies'

const logger = createLogger()

export async function install(cwd = './dist') {
  try {
    logger.info(colors.blue(`提取第三方依赖包`))
    const pkgs = getDependencies().filter(i => !builtinModules.includes(i))
    await spawn.sync('npm', ['init', '-y'], { cwd })
    logger.info(colors.blue(`提取成功:${pkgs.join()}`))
    logger.info(colors.blue('正在安装...'))
    await spawn.sync('npm', ['install', ...pkgs], { cwd })
    logger.info(colors.green('安装成功'))
  }
  catch (error: any) {
    logger.error(error.message)
  }
}
