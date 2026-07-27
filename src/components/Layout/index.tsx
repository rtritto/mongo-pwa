import '@/styles/styles.css'
import '@/styles/tailwind.css'
import '@/styles/speed-highlight.css'

import { type Component, type JSX, Show } from 'solid-js'
import { useData } from 'vike-lite-solid'

import NavBar from './NavBar'
import { useManagerAuth } from '../utils/hooks/useManagerAuth'

export const Layout: Component<{ children?: JSX.Element }> = (props) => {
  const [data] = useData<DataLayout>()
  const { isAuthorized, login } = useManagerAuth(data.isAuthorized)

  const App = () => (
    <main>
      <header class="sticky top-0 z-40">
        <div class="px-8">
          <NavBar data={data} />
        </div>
      </header>

      <div class="px-24">
        <div class="max-w-7xl">
          {props.children}
        </div>
      </div>
    </main>
  )

  return (
    <Show when={!data.options.auth.enabled || isAuthorized()} fallback={
      <label>
        <span class="label">Insert Auth Password</span>

        <input
          type="password"
          class="input m-2"
          placeholder="Insert Password"
          onKeyDown={(event) => { if (event.key === 'Enter') login(event.currentTarget.value) }}
        />
      </label>
    }>
      <App />
    </Show>
  )
}
