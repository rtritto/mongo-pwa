type PageContextServer = import('vike/types').PageContextServer

type DataAsync<Data = unknown> = (pageContext: PageContextServer) => Promise<Data>

type DataSync<Data = unknown> = (pageContext: PageContextServer) => Data
