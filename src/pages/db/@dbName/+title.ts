import type { PageContext } from 'vike-lite'
export const title = (pageContext: PageContext<DataDB>) => pageContext.data.title
