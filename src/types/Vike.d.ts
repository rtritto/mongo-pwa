type PageContextAdditional = {
  options: Config['options']
}

type PageContextServer = import('vike/types').PageContextServer & PageContextAdditional

type PageContext = (PageContextServer | import('vike/types').PageContextClient) & PageContextAdditional

type DataAsync<Data = unknown> = (pageContext: PageContextServer) => Promise<Data>

type DataSync<Data = unknown> = (pageContext: PageContextServer) => Data
