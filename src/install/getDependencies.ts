import { builtinModules } from 'node:module'
import parser from '@babel/parser'
import _traverse from '@babel/traverse'
import fs from 'fs-extra'
// fix: traverse is not a function
// github issues https://github.com/babel/babel/issues/13855
const traverse = (_traverse as any).default

// 筛选包名
// issues https://github.com/QC2168/vite-plugin-utools/issues/1
function extractContentBasedOnConditions(str: string) {
  // 判断包名是否作者开头
  if (str.startsWith('@'))
    return str
  // 返回第一个/前面的包名
  const slashIndex = str.indexOf('/')
  return slashIndex === -1 ? str : str.substring(0, slashIndex)
}

export interface GetDependenciesOptions {
  deps?: string[]
  rootPackage?: {
    path: string
  } | null
}

export function getPackagesFormFilePath(filePath: string) {
  if (!fs.pathExistsSync(filePath)) {
    console.error(`文件不存在:${filePath}`)
  }
  const content = fs.readJSONSync(filePath, 'utf-8')
  const { dependencies = {}, devDependencies = {} } = content
  return {
    ...dependencies,
    ...devDependencies,
  }
}

export default function getDependencies(filePath: string, {
  deps = [],
  rootPackage = null,
}: GetDependenciesOptions) {
  const code = fs.readFileSync(filePath, 'utf-8')
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
  const rootPkg = rootPackage ? getPackagesFormFilePath(rootPackage.path) : {}
  const packageNames: string[] = []
  packageNames.push(...deps)
  traverse(ast, {
    ImportDeclaration(path: any) {
      const source = path.node.source.value
      // obtain package name
      const packName = extractContentBasedOnConditions(source)
      // obtain version from root package
      const version = rootPkg[packName] || false
      packageNames.push(version ? `${packName}@${version}` : packName)
    },
    CallExpression(path: any) {
      if (

        path.node.callee.name === 'require'
        && path.node.arguments.length === 1
        && path.node.arguments[0].type === 'StringLiteral'
      ) {
        const packName = extractContentBasedOnConditions(path.node.arguments[0].value)
        // obtain version from root package
        const version = rootPkg[packName] || false
        packageNames.push(version ? `${packName}@${version}` : packName)
      }
    },
  })
  // 过滤electron，node内置库
  return packageNames.filter(pkg => !builtinModules.includes(pkg) && !pkg.startsWith('node:') && pkg !== 'electron')
}
