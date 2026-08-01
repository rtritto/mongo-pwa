import { createEffect, createSignal, createMemo, type Component } from 'solid-js'
import { navigate } from 'vike-lite/client/router'

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
  const [checkboxAggregate, setCheckboxAggregate] = createSignal(props.data.aggregate || false)

  createEffect(() => {
    setCodeQuery(props.data.query || EMPTY_OBJECT_TEMPLATE)
    setCodeProjection(props.data.projection || EMPTY_OBJECT_TEMPLATE)
    setCheckboxAggregate(props.data.aggregate || false)
  })

  // createMemo automatically re-evaluates if codeQuery OR checkboxAggregate changes
  const isCodeQueryValid = createMemo(() => {
    const qVal = codeQuery()
    const cleanQuery = qVal.replaceAll(/\s+/g, '')
    const isAgg = checkboxAggregate()
    // Remove all spaces, tabs, and newlines for a safe check
    if (cleanQuery === '' || cleanQuery === '{}' || (isAgg && cleanQuery === '[]')) return true

    return !(isAgg ? isValidAggregation : isValidQuery)(qVal).error
  })
  // createMemo automatically re-evaluates if codeProjection changes
  const isCodeProjectionValid = createMemo(() => {
    const pVal = codeProjection()
    const cleanProjection = pVal.replaceAll(/\s+/g, '')
    // Remove all spaces, tabs, and newlines for a safe check
    if (cleanProjection === '' || cleanProjection === '{}') return true

    return !isValidProjection(pVal).error
  })

  const handleSave = async () => {
    if (isCodeQueryValid() && isCodeProjectionValid()) {
      const params = new URLSearchParams()

      const qVal = codeQuery()
      // Remove all spaces, tabs, and newlines for a safe check
      const cleanQuery = qVal.replaceAll(/\s+/g, '')

      // Adds the query only if it is not empty, not {} and not [] (for aggregations)
      if (cleanQuery !== '' && cleanQuery !== '{}' && cleanQuery !== '[]') params.set('query', qVal)

      const pVal = codeProjection()
      // Remove all spaces, tabs, and newlines for a safe check
      const cleanProjection = pVal.replaceAll(/\s+/g, '')

      // Adds the projection only if it is not empty and not {}
      if (cleanProjection !== '' && cleanProjection !== '{}') params.set('projection', pVal)

      if (checkboxAggregate()) params.set('aggregate', 'true')

      const queryString = params.toString() ? `?${params.toString()}` : ''

      await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}${queryString}`)
    }
  }

  return (
    <div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="label">
            <span><b>Query</b></span>
          </label>

          <CodeEditor
            value={codeQuery()}
            readOnly={false}
            onChange={setCodeQuery}
            onSave={handleSave}
          />
        </div>

        <div>
          <label class="label">
            <span><b>Projection</b></span>
          </label>

          <CodeEditor
            value={codeProjection()}
            readOnly={false}
            onChange={setCodeProjection}
            onSave={handleSave}
          />
        </div>
      </div>

      <div class="mt-4 flex items-center gap-4">
        <fieldset class="fieldset w-64 rounded-box border border-base-300 bg-base-100 p-4">
          <label class="label">
            <input class="checkbox" type="checkbox" checked={checkboxAggregate()} onChange={(e) => setCheckboxAggregate(e.target.checked)} />

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
