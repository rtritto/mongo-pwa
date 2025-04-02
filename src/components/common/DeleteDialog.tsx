import {
  Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, TextField
} from '@suid/material'
import type OutlinedInputProps from '@suid/material/OutlinedInput/OutlinedInputProps'
import { type Component, createSignal } from 'solid-js'

import CustomDialog from './CustomDialog'
import IconDelete from '@/components/Icons/IconDelete'

const DeleteDialog: Component<{
  value: string
  entity: string
  tooltipTitle: string
  handleDelete: (input: string) => void
}> = (props) => {
  const [open, setOpen] = createSignal(false)
  const [input, setInput] = createSignal('')

  const handleOpen = () => { setOpen(true) }
  const handleClose = () => { setOpen(false) }

  const handleOnChange = (event: OutlinedInputProps['onChange']) => {
    setInput(event.currentTarget.value)
  }

  return (
    <>
      <div class="tooltip" data-tip={props.tooltipTitle}>
        <button class="btn bg-red-700 py-0.5" onClick={handleOpen}>
          <IconDelete />

          Del
        </button>
      </div>

      {open() && (
        <CustomDialog disableBackdropClick disableEscapeKeyDown open={open()} onClose={handleClose}>
          <DialogTitle>
            Delete {props.entity}
          </DialogTitle>

          <Divider />

          <DialogContent>
            <DialogContentText>
              You are about to delete whole <strong>{props.value}</strong> {props.entity}.
            </DialogContentText>

            <TextField
              autoFocus
              fullWidth
              margin="dense"
              onChange={handleOnChange}
              placeholder={props.value}
              size="small"
              type="string"
              value={input()}
              variant="outlined"
              sx={{ pl: 0.5 }}
            />
          </DialogContent>

          <Divider />

          <DialogActions>
            <Button
              id="delete"
              onClick={() => {
                props.handleDelete(input())
                handleClose()
                setInput('')  // Reset value
              }}
              disabled={input() !== props.value}
              size="small"
              value={props.value}
              variant="contained"
              sx={{ backgroundColor: 'rgb(108, 49, 47)', m: 1 }}
            >
              Delete
            </Button>

            <Button
              onClick={handleClose}
              size="small"
              variant="contained"
              sx={{ m: 1 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  )
}

export default DeleteDialog
