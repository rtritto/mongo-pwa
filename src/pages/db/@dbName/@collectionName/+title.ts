import type { PageContext } from 'vike/types'

export const title = (pageContext: PageContext<DataCollection>) => pageContext.data.title
