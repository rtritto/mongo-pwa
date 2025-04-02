import type { PageContext } from 'vike/types'

export const title = (pageContext: PageContext<DataDB>) => pageContext.data.title
