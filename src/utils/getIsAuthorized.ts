import type { PageContextServer } from 'vike-lite'

import { ConfigDefault, IS_PRODUCTION } from '../../config.default'

const { authCookieKey, authCookiePassword } = ConfigDefault.options.auth

export function getIsAuthorized(pageContext: PageContextServer): boolean {
  if (!IS_PRODUCTION) return true
  const isAuthorized = (pageContext.headers as Headers).get('cookie')?.includes(`${authCookieKey}=${authCookiePassword}`) === true
  return isAuthorized
}
