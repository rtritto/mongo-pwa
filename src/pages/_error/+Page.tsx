import { Show } from 'solid-js'
import { usePageContext } from 'vike-lite-solid'

export default function Page() {
  const pageContext = usePageContext()
  return (
    <Show
      when={pageContext.is404}
      fallback={
        <>
          <h1>500</h1>
          <p>{pageContext.errorMessage ?? 'Internal Server Error'}</p>
        </>
      }
    >
      <h1>404</h1>
      <p>{pageContext.errorMessage ?? 'Page Not Found'}</p>
    </Show>
  )
}
