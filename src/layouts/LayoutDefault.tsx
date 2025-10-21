import './styles.css'
import './tailwind.css'

import { type Component, type JSX, Show, createSignal, onMount } from 'solid-js'
import { useData } from 'vike-solid/useData'

import NavBar from './NavBar'

export const LayoutDefault: Component<{ children?: JSX.Element }> = (props) => {
  const [data] = useData<DataLayout>()

  const [password, setPassword] = createSignal<string | null>(null)

  onMount(() => {
    if (data.options.localStorageAuth.enabled) {
      setPassword(localStorage.getItem(data.options.localStorageAuth.localStorageAuthKey) || '')
    }
  })

  const App = () => (
    <main>
      <header class="sticky top-0 z-40">
        <div class="px-8">
          <NavBar />
        </div>
      </header>

      <div class="flex px-24">
        <div class="max-w-7xl">
          {props.children}
        </div>
      </div>
    </main>
  )

  return (
    <Show
      when={!data.options.localStorageAuth.enabled || password() === data.options.localStorageAuth.localStorageAuthPassword}
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
                localStorage.setItem(data.options.localStorageAuth.localStorageAuthKey!, event.currentTarget.value)
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
