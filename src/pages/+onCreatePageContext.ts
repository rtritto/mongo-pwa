export function onCreatePageContext(pageContext: PageContext) {
  pageContext.options = globalThis.config?.options
}
