/** @link https://github.com/mongodb-js/devtools-shared/blob/main/packages/shell-bson-parser/src/options.ts */

export type Options = {
  mode: 'loose' | 'strict' | 'extended'
  allowMethods?: boolean
  allowComments?: boolean
}
