import type { Context } from 'hono'

export function userRetrieve(c: Context) {
  return c.text('Hello World!')
}
