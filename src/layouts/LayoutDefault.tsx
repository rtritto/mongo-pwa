import './styles.css'
import './tailwind.css'

import { type Component, type JSX, Show, createSignal, onMount } from 'solid-js'
import { useData } from 'vike-solid/useData'

import NavBar from './NavBar'

export const LayoutDefault: Component<{ children?: JSX.Element }> = (props) => {
  const [data] = useData<DataLayout>()

  const [password, setPassword] = createSignal<string | null>(null)

  onMount(() => {
    if (data?.options?.localStorageAuth.enabled) {
      setPassword(localStorage.getItem(data.options.localStorageAuth.localStorageAuthKey) || '')
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
      when={!data?.options?.localStorageAuth.enabled || password() === data?.options?.localStorageAuth.localStorageAuthPassword}
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
