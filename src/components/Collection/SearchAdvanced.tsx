import { createEffect, createSignal, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import CodeEditor from '@/components/common/CodeEditor'
import IconSearch from '@/components/Icons/IconSearch'
import isValidQuery from '@/utils/validations/isValidQuery'
import isValidProjection from '@/utils/validations/isValidProjection'
import { isValidAggregation } from '@/utils/validations/isValidAggregation'

const EMPTY_OBJECT_TEMPLATE = `{
  
}`

const SearchAdvanced: Component<{ data: DataCollection }> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const [codeQuery, setCodeQuery] = createSignal(props.data.query || EMPTY_OBJECT_TEMPLATE)
  // eslint-disable-next-line solid/reactivity
  const [codeProjection, setCodeProjection] = createSignal(props.data.projection || EMPTY_OBJECT_TEMPLATE)
  // eslint-disable-next-line solid/reactivity
  const [checkboxAggregate, setCheckboxAggregate] = createSignal(props.data.aggregate)
  const [isCodeQueryValid, setIsCodeQueryValid] = createSignal(true)
  const [isCodeProjectionValid, setIsCodeProjectionValid] = createSignal(true)

  createEffect(() => {
    setCodeQuery(props.data.query || EMPTY_OBJECT_TEMPLATE)
    setCodeProjection(props.data.projection || EMPTY_OBJECT_TEMPLATE)
    setCheckboxAggregate(props.data.aggregate)
  })

  const handleSave = async () => {
    if (isCodeQueryValid() && isCodeProjectionValid()) {
      const queryStr: string[] = []

      const qVal = codeQuery()
      // Remove all spaces, tabs, and newlines for a safe check
      const cleanQuery = qVal.replace(/\s+/g, '')

      // Adds the query only if it is not empty, not {} and not [] (for aggregations)
      if (cleanQuery !== '' && cleanQuery !== '{}' && cleanQuery !== '[]') {
        queryStr.push(`query=${encodeURIComponent(qVal)}`)
      }

      const pVal = codeProjection()
      // Remove all spaces, tabs, and newlines for a safe check
      const cleanProjection = pVal.replace(/\s+/g, '')

      // Adds the projection only if it is not empty and not {}
      if (cleanProjection !== '' && cleanProjection !== '{}') {
        queryStr.push(`projection=${encodeURIComponent(pVal)}`)
      }

      if (checkboxAggregate()) {
        queryStr.push('aggregate=true')
      }

      const queryString = queryStr.length > 0 ? `?${queryStr.join('&')}` : ''

      await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}${queryString}`)
    }
  }

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label">
            <span class="label-text"><b>Query</b></span>
          </label>

          <CodeEditor
            value={codeQuery()}
            readOnly={false}
            onChange={(newCode) => {
              setCodeQuery(newCode)
              // Remove all spaces, tabs, and newlines for a safe check
              const cleanQuery = newCode.replace(/\s+/g, '')
              if (cleanQuery !== '' && cleanQuery !== '{}' && (checkboxAggregate() ? cleanQuery !== '[]' : true)) {
                setIsCodeQueryValid(!(checkboxAggregate() ? isValidAggregation : isValidQuery)(newCode).error)
              }
            }}
            onSave={handleSave}
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text"><b>Projection</b></span>
          </label>

          <CodeEditor
            value={codeProjection()}
            readOnly={false}
            onChange={(newCode) => {
              setCodeProjection(newCode)
              // Remove all spaces, tabs, and newlines for a safe check
              const cleanProjection = newCode.replace(/\s+/g, '')
              if (cleanProjection !== '' && cleanProjection !== '{}') {
                setIsCodeProjectionValid(!isValidProjection(newCode).error)
              }
            }}
            onSave={handleSave}
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
          disabled={!isCodeQueryValid() || !isCodeProjectionValid()}
          onClick={handleSave}
        >
          <IconSearch />

          Find
        </button>
      </div>
    </div>
  )
}

export default SearchAdvanced
