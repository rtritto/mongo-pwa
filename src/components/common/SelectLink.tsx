import { FormControl, Select } from '@suid/material'
import type { SelectChangeEvent } from '@suid/material/Select'
import type { PrimitiveAtom } from 'jotai'
import { useAtom } from 'solid-jotai'
import { type Component, For, type JSXElement } from 'solid-js'

import CustomLink from './CustomLink'

const SelectLink: Component<{
  baseUrl: string
  entities: string[]
  label: string
  selectedState: PrimitiveAtom<string | undefined>
}> = (props) => {
  const [selected, setSelected] = useAtom(props.selectedState)

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value)
  }

  return (
    <FormControl sx={{ display: selected() ? 'inline' : 'inline-flex', minWidth: 120 }} fullWidth size="small">
      {selected() && (
        <CustomLink
          LinkProps={{
            href: `${props.baseUrl}/${encodeURIComponent(selected())}`
            // style:{
            //   textDecoration: 'none'  // remove text underline  // missing, not necessary
            // }
          }}
          ButtonProps={{
            sx: {
              color: 'rgb(153, 143, 143)',
              justifyContent: 'flex-start',
              pl: 0,
              pr: 0.5,
              textTransform: 'none',  // remove uppercase
              ':hover': {
                color: 'white'
              }
            },
            variant: 'text'
          }}
        >
          {props.label}:
        </CustomLink>
      )}
      {JSON.stringify(props.entities)}
      {/* <Select
        id={`select${props.label}`}
        displayEmpty
        renderValue={(value: string): JSXElement =>
          (value === '' ? props.label : value) as string
        }
        value={selected()}
        onChange={handleChange}
        style={{
          color: 'rgb(153, 143, 143)'
        }}
        sx={{
          ':hover': {
            color: 'white'
          }
        }}
        MenuProps={{
          MenuListProps: {
            disablePadding: true
          }
        }}
      >
        <For each={props.entities}>
          {(entity) => (
            <CustomLink
              LinkProps={{
                href: `${props.baseUrl}/${encodeURIComponent(entity)}`,
                style: {
                  display: 'flex',
                  margin: '1px',
                  // textDecoration: 'none',  // remove text underline  // missing, not necessary
                  ...(selected() === entity) && {
                    pointerEvents: 'none'  // disable onClick when selected
                  }
                }
              }}
              ButtonProps={{
                disabled: selected() === entity,
                fullWidth: true,
                sx: {
                  justifyContent: 'flex-start',
                  paddingLeft: 2,
                  textTransform: 'none',  // remove uppercase
                  background: selected() === entity ? 'grey' : 'darkgrey'
                },
                value: entity,
                variant: 'contained'
              }}
            >
              {entity}
            </CustomLink>
          )}
        </For>
      </Select> */}
    </FormControl>
  )
}

export default SelectLink
