import { createSignal, For, Show, type Component } from 'solid-js'

const isExpandable = (v: any) => v && typeof v === 'object'

function JsonNode(props: {
  keyName: string | null
  value: any
  level: number
  isArrayItem?: boolean
  isLast?: boolean
}) {
  const [open, setOpen] = createSignal(props.level < 1)

  const isArray = Array.isArray(props.value)
  const isObject = !isArray && typeof props.value === 'object'
  const isExpandableNode = isExpandable(props.value)

  return (
    <div class="ml-2">
      <Show when={isExpandableNode}>
        <div class="cursor-pointer" onClick={() => setOpen(!open())}>
          <span class="text-purple-300 select-none">{open() ? '▼ ' : '▶ '}</span>

          <Show when={!props.isArrayItem && props.keyName !== null}>
            <span class="text-blue-300">{props.keyName}</span>

            <span class="text-gray-400">: </span>
          </Show>

          <span class="text-gray-500">
            {isArray ? (open() ? '[' : '[ … ]') : (open() ? '{' : '{ … }')}
          </span>
        </div>

        <Show when={open()}>
          <div class="ml-1 border-l border-gray-600 pl-2 mt-1">
            <Show when={isArray}>
              <For each={props.value}>
                {(item, i) => (
                  <JsonNode
                    keyName={null}
                    value={item}
                    level={props.level + 1}
                    isArrayItem={true}
                    isLast={i() === props.value.length - 1}
                  />
                )}
              </For>
            </Show>

            <Show when={isObject}>
              <For each={Object.entries(props.value)}>
                {([k, v], i) => (
                  <JsonNode
                    keyName={k}
                    value={v}
                    level={props.level + 1}
                    isArrayItem={false}
                    isLast={i() === Object.entries(props.value).length - 1}
                  />
                )}
              </For>
            </Show>
          </div>

          <span class="text-gray-500">
            {isArray ? ']' : '}'}

            {props.isLast ? '' : ','}
          </span>
        </Show>
      </Show>

      <Show when={!isExpandableNode}>
        <div>
          <Show when={!props.isArrayItem && props.keyName !== null}>
            <span class="text-blue-300">{props.keyName}</span>

            <span class="text-gray-400">: </span>
          </Show>

          <span class="text-green-300">{props.value}</span>

          <Show when={!props.isLast}>
            <span class="text-gray-500">,</span>
          </Show>
        </div>
      </Show>
    </div>
  )
}

const JsonViewer: Component<{ data: any }> = (props) => {
  return (
    <div class="font-mono text-sm bg-gray-900 text-white p-4 rounded-xl shadow overflow-auto">
      <JsonNode keyName={null} value={props.data} level={0} isLast={true} />
    </div>
  )
}

export default JsonViewer
