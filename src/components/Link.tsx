import type { Component, JSX } from 'solid-js'

const Link: Component<{ href: string, children: JSX.Element }> = (props) => {
  return (
    <a href={props.href}>
      {props.children}
    </a>
  )
}

export default Link
