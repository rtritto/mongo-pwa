import type { Component, JSXElement, JSX } from 'solid-js'

import { Button } from '@suid/material'
import type { ButtonProps } from '@suid/material/Button/ButtonProps'

const CustomLink: Component<{
  LinkProps: JSX.AnchorHTMLAttributes<HTMLAnchorElement>
  ButtonProps: ButtonProps
  children: JSXElement
}> = (props) => {
  return (
    <a  // TODO implement Vike Link
      {...props.LinkProps}
    >
      <Button  // TODO implement passHref on parent component
        {...props.ButtonProps}
      >
        {props.children}
      </Button>
    </a>
  )
}

export default CustomLink
