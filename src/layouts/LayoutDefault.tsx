import './styles.css'
import './tailwind.css'

import type { Component, JSX } from 'solid-js'

import NavBar from './NavBar'

export const LayoutDefault: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <div>
      <NavBar />

      <main class="flex justify-center">
        <div class="max-w-7xl">
          {props.children}
        </div>
      </main>
    </div>
  )
}
