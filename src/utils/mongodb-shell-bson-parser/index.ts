/**
 * @mongodb-js/shell-bson-parser v1.5.7
 * @link https://github.com/mongodb-js/devtools-shared/blob/main/packages/shell-bson-parser/src/index.ts
 */

import { parse as parseAST } from 'acorn'
import type { Node } from 'estree'

import { checkTree } from './check'
import { executeAST } from './eval'
import type { Options } from './options'

function buildAST(input: string): { ast: Node, hasComments: boolean } {
  let hasComments = false

  const ast = parseAST(input, {
    ecmaVersion: 6,
    onComment: () => (hasComments = true),
    locations: true,
    ranges: true,
    sourceFile: input
  }) as Node

  return {
    ast,
    hasComments
  }
}

export default function parse(input: string, options: Options) {
  const { hasComments, ast } = buildAST(
    // Wrapping input into brackets with newlines so that parser can correctly
    // process an expression and handle possible trailing comments
    `(\n${input}\n)`
  )

  const passedCommentsCheck = !hasComments || options.allowComments

  if (passedCommentsCheck && checkTree(ast, options)) {
    return executeAST(ast)
  }

  return ''
}
