import {
  Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, SvgIcon, TextField
  /* TODO , Tooltip*/
} from '@suid/material'
import type OutlinedInputProps from '@suid/material/OutlinedInput/OutlinedInputProps'
import { type Component, createSignal } from 'solid-js'

import { Delete } from '../SvgIcons'
import CustomDialog from './CustomDialog'

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
      {/* <Tooltip title={props.tooltipTitle}> */}
      <Button
        onClick={handleOpen}
        startIcon={<SvgIcon><path d={Delete} /></SvgIcon>}
        value={props.value}
        variant="contained"
        sx={{
          backgroundColor: 'rgb(108, 49, 47)',
          flexDirection: 'column',
          // px: 4,
          py: 0.5,
          textTransform: 'none'
        }}
      >
        Del
      </Button>
      {/* </Tooltip> */}

      {open() === true && (
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
