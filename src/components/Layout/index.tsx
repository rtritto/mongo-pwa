import '@/styles/styles.css'
import '@/styles/tailwind.css'
import '@/styles/speed-highlight.css'

import { type ParentComponent, Show } from 'solid-js'
import { useData } from 'vike-lite-solid'

import NavBar from './NavBar'
import Alerts from './Alerts'
import { useManagerAuth } from '../utils/hooks/useManagerAuth'

export const Layout: ParentComponent = (props) => {
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
          {/*
            To test:
            - navigate to /db/<DB>/<COL>
            - click view doc to navigate to /db/<DB>/<COL>/<DOC>
            - change the doc
            - click BackButton
            - the alert should appear if it works
          */}
          <Alerts data={data} />

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
