import './styles.css'
import './tailwind.css'

import { type Component, type JSX, Show, createSignal, onMount } from 'solid-js'
import { usePageContext } from 'vike-solid/usePageContext'

import NavBar from './NavBar'

export const LayoutDefault: Component<{ children?: JSX.Element }> = (props) => {
  const pageContext = usePageContext() as PageContext

  const [password, setPassword] = createSignal<string | null>(null)

  onMount(() => {
    if (pageContext.options?.localStorageAuth.enabled) {
      setPassword(localStorage.getItem(pageContext.options.localStorageAuth.localStorageAuthKey) || '')
    }
  })

  const App = () => (
    <div>
      <NavBar />

      <main class="flex justify-center">
        <div class="max-w-7xl">
          {props.children}
        </div>
      </main>
    </div>
  )

  return (
    <Show
      when={!pageContext.options?.localStorageAuth.enabled || password() === pageContext.options?.localStorageAuth.localStorageAuthPassword}
      fallback={
        password() === null ? null : (
          <label>
            <span class="label">Insert LocalStorage Password</span>

            <input
              type="password"
              class="input m-2"
              placeholder="Insert Password"
              onInput={(event) => {
                setPassword(event.currentTarget.value)
                localStorage.setItem(pageContext.options.localStorageAuth.localStorageAuthKey!, event.currentTarget.value)
              }}
            />
          </label>
        )
      }
    >
      <App />
    </Show>
  )
}
