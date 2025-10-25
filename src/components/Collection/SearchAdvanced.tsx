import { createSignal, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import createCodeMirror from '@/components/common/createCodeMirror'
import IconSearch from '../Icons/IconSearch'

const template = `{
  
}`

const SearchAdvanced: Component<{ data: DataCollection }> = (props) => {
  const { editorView: editorViewQuery, ref: editorRefQuery } = createCodeMirror(template)
  const { editorView: editorViewProjection, ref: editorRefProjection } = createCodeMirror(template)
  const [checkboxAggregate, setCheckboxAggregate] = createSignal(false)

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label">
            <span class="label-text"><b>Query</b></span>
          </label>

          <div ref={editorRefQuery} />
        </div>

        <div>
          <label class="label">
            <span class="label-text"><b>Projection</b></span>
          </label>

          <div ref={editorRefProjection} />
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4">
        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
          <label class="label">
            <input class="checkbox" type="checkbox" checked={checkboxAggregate()} onChange={() => setCheckboxAggregate(!checkboxAggregate())} />

            Aggregate query
          </label>
        </fieldset>

        <button
          class="btn bg-blue-500"
          // TODO validation
          // disabled if both are invalid
          // disabled={!isValid(editorViewQuery()?.state.doc.toString()) || !isValid(editorViewProjection()?.state.doc.toString())}
          onClick={async () => {
            const queryStr = [
              ...editorViewQuery()!.state.doc.toString() ? [`query=${encodeURIComponent(editorViewQuery()!.state.doc.toString())}`] : [],
              ...editorViewProjection()!.state.doc.toString() ? [`projection=${encodeURIComponent(editorViewProjection()!.state.doc.toString())}`] : [],
              ...checkboxAggregate() ? ['aggregate=true'] : []
            ].join('&')
            await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}?${queryStr}`)
          }}
        >
          <IconSearch />

          Find
        </button>
      </div>
    </div>


  )
}

export default SearchAdvanced
