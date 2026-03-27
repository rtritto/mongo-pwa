import { createSignal, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import CodeEditor from '@/components/common/CodeEditor'
import IconSearch from '@/components/Icons/IconSearch'
import { toSafeBSON } from '@/utils/bson'

const template = `{
  
}`

const SearchAdvanced: Component<{ data: DataCollection }> = (props) => {
  const [currentCodeQuery, setCurrentCodeQuery] = createSignal(template)
  const [currentCodeProjection, setCurrentCodeProjection] = createSignal(template)
  const [isQueryValid, setIsQueryValid] = createSignal(true)
  const [isProjectionValid, setIsProjectionValid] = createSignal(true)
  const [checkboxAggregate, setCheckboxAggregate] = createSignal(false)

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label">
            <span class="label-text"><b>Query</b></span>
          </label>

          <CodeEditor
            value={currentCodeQuery()}
            readOnly={false}
            onChange={(newCode) => {
              setCurrentCodeQuery(newCode)
              setIsQueryValid(!!toSafeBSON(newCode))
            }}
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text"><b>Projection</b></span>
          </label>

          <CodeEditor
            value={currentCodeProjection()}
            readOnly={false}
            onChange={(newCode) => {
              setCurrentCodeProjection(newCode)
              setIsProjectionValid(!!toSafeBSON(newCode))
            }}
          />
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
          disabled={!isQueryValid() || !isProjectionValid()}
          onClick={async () => {
            const queryStr = [
              ...currentCodeQuery() ? [`query=${encodeURIComponent(currentCodeQuery())}`] : [],
              ...currentCodeProjection() ? [`projection=${encodeURIComponent(currentCodeProjection())}`] : [],
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
