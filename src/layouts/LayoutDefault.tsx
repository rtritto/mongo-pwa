import './styles.css'
import './tailwind.css'

import type { JSX } from 'solid-js'

import { Link } from '@/components/Link'

function Sidebar(props: { children: JSX.Element }) {
  return (
    <div
      id="sidebar"
      style={{
        padding: '20px',
        'flex-shrink': 0,
        display: 'flex',
        'flex-direction': 'column',
        'line-height': '1.8em',
        'border-right': '2px solid #eee'
      }}
    >
      {props.children}
    </div>
  )
}

function Content(props: { children: JSX.Element }) {
  return (
    <div id="page-container">
      <div
        id="page-content"
        style={{
          padding: '20px',
          'padding-bottom': '50px',
          'min-height': '100vh'
        }}
      >
        {props.children}
      </div>
    </div>
  )
}

export function LayoutDefault(props: { children?: JSX.Element }) {
  return (
    <div
      style={{
        display: 'flex',
        'max-width': '900px',
        margin: 'auto'
      }}
    >
      <Sidebar>
        <Link href="/">Welcome</Link>
      </Sidebar>
      <Content>{props.children}</Content>
    </div>
  )
}
