import { createSignal, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import createCodeMirror from '@/components/common/createCodeMirror'
import IconSearch from '../Icons/IconSearch'

const SearchAdvanced: Component<{ data: DataCollection }> = (props) => {
  const { editorView: editorViewQuery, ref: editorRefQuery } = createCodeMirror('')
  const { editorView: editorViewProjection, ref: editorRefProjection } = createCodeMirror('')
  const [checkboxAggregate, setCheckboxAggregate] = createSignal(false)

  return (
    <div class="">
      <div>
        <label class="label">
          <span class="label-text">Query</span>
        </label>

        <div ref={editorRefQuery} />
      </div>

      <div>
        <label class="label">
          <span class="label-text">Projection</span>
        </label>

        <div ref={editorRefProjection} />
      </div>

      <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
        <label class="label">
          <input class="checkbox" type="checkbox" checked={checkboxAggregate()} onChange={() => setCheckboxAggregate(!checkboxAggregate())} />

          Aggregate query
        </label>
      </fieldset>
      {editorViewQuery()?.state.doc.toString()}
      <button
        class="btn bg-blue-500"
        // TODO validation
        // disabled if both are invalid
        // disabled={(editorViewQuery()?.state.doc.toString() !== '' && !isValid(editorViewQuery()?.state.doc.toString())) && (editorViewProjection()?.state.doc.toString() !== '' && !isValid(editorViewProjection()?.state.doc.toString()))}
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


  )
}

export default SearchAdvanced
