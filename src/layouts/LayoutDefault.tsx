import './styles.css'
import './tailwind.css'

import type { Component, JSX } from 'solid-js'

import NavBar from './NavBar'

export const LayoutDefault: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <div class="flex flex-col min-h-screen">
      <NavBar />

      <main class="flex justify-center">
        {props.children}
      </main>
    </div>
  )
}
