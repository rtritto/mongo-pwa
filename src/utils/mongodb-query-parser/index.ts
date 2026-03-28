/**
 * mongodb-query-parser v4.7.7
 * @link https://github.com/mongodb-js/devtools-shared/blob/main/packages/query-parser/src/index.ts
 */

import parseShellStringToEJSON from '../mongodb-shell-bson-parser'

export { toJSString } from './stringify'

/** @public */
export default function queryParser(
  filter: string
) {
  // Original function is _parseFilter
  return parseShellStringToEJSON(filter, {
    mode: 'loose',
    allowMethods: true,
    allowComments: true
  })
}
