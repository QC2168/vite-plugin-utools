import { builtinModules } from 'node:module'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs-extra'

export default function getDependencies(filePath: string) {
  const code = readFileSync(filePath, 'utf-8')
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  const packageNames: string[] = []

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value
      packageNames.push(source)
    },
    CallExpression(path) {
      if (
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        path.node.callee.name === 'require'
        && path.node.arguments.length === 1
        && path.node.arguments[0].type === 'StringLiteral'
      )
        packageNames.push(path.node.arguments[0].value)
    },
  })
  // 过滤electron，node内置库
  return packageNames.filter(pkg => !builtinModules.includes(pkg) && !pkg.startsWith('node:') && pkg !== 'electron')
}
