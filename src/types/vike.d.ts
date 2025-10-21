type PageContextServer = import('vike/types').PageContextServer

type PageContext = PageContextServer | import('vike/types').PageContextClient

type DataAsync<Data = unknown> = (pageContext: PageContextServer) => Promise<Data>

type DataSync<Data = unknown> = (pageContext: PageContextServer) => Data
