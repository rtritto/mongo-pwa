import { Dialog } from '@suid/material'
import type { Component, JSXElement } from 'solid-js'

const CustomDialog: Component<{
  children: JSXElement
  disableBackdropClick: boolean
  disableEscapeKeyDown: boolean
  onClose: () => void
  open: boolean
}> = (props) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    children,
    disableBackdropClick,
    disableEscapeKeyDown,
    onClose,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    open,
    ...rest
  } = props
  const handleClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return
    }

    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return
    }

    if (typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    // eslint-disable-next-line unicorn/consistent-destructuring
    <Dialog open={props.open} onClose={handleClose} {...rest}>
      {/* eslint-disable-next-line unicorn/consistent-destructuring */}
      {props.children}
    </Dialog>
  )
}

export default CustomDialog
