import type { GetDependenciesOptions } from './getDependencies'
import spawn from 'cross-spawn'
import colors from 'picocolors'
import { createLogger } from 'vite'
import getDependencies from './getDependencies'

const logger = createLogger()
const defaultFilePath = ['./dist/preload.js']

export interface InstallOptionsType {
  cwd: string
  dependenciesOptions: GetDependenciesOptions
}

const DEFAULT_INSTALL_OPTIONS: InstallOptionsType = {
  dependenciesOptions: {
    deps: [],
    rootPackage: null,
  },
  cwd: './dist',
}
export async function install(paths = defaultFilePath, options: InstallOptionsType = DEFAULT_INSTALL_OPTIONS) {
  try {
    const installOptions = Object.assign(DEFAULT_INSTALL_OPTIONS, options)
    const { cwd } = installOptions
    logger.info(colors.cyan('提取第三方依赖包'))
    if (installOptions.dependenciesOptions.rootPackage?.path) {
      logger.info(colors.yellow(`已启用读取特定Package.json文件，同步依赖版本`))
      logger.info(colors.yellow(`文件路径：${installOptions.dependenciesOptions.rootPackage?.path}`))
      // 分割线
      logger.info(colors.gray(`------------------------------------------------------------`))
    }
    const allPkgs = paths.reduce((pkgs: string[], path) => {
      logger.info(`${colors.cyan(`正在提取`)} ${path}`)
      return [...pkgs, ...getDependencies(path, installOptions.dependenciesOptions)]
    }, [])

    const uniquePkgs = Array.from(new Set(allPkgs))

    await spawn.sync('npm', ['init', '-y'], { cwd })

    logger.info(colors.cyan(`提取成功：${uniquePkgs.join('、')}`))
    logger.info(colors.cyan(`总共${uniquePkgs.length}个依赖包`))
    logger.info(colors.gray(`------------------------------------------------------------`))
    if (uniquePkgs.length > 0) {
      logger.info(colors.gray('正在安装...'))
      await spawn.sync('npm', ['install', '--production', ...uniquePkgs], { cwd })
      logger.info(colors.green('安装成功'))
    }
    else {
      logger.info(colors.green('无需安装'))
    }
  }
  catch (error: any) {
    logger.error(error.message)
  }
}
