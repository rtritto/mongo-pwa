import { createSignal, For, Show, type Component } from 'solid-js'

const MAX_LEN = 50

const RenderText = (props: { text: string }) => {
  const [expanded, setExpanded] = createSignal(false)

  const displayValue = () => expanded() || props.text.length <= MAX_LEN
    ? props.text
    : props.text.slice(0, MAX_LEN) + '…'

  // break-all split text; remove it to make it one line
  return (
    <span
      class="cursor-pointer break-all whitespace-nowrap"
      title={props.text}
      onClick={() => setExpanded(!expanded())}
    >
      "{displayValue()}"
    </span>
  )
}

function JsonNode(props: {
  keyName: string | null
  value: any
  level: number
  isObjectItem?: boolean
  isLast?: boolean
}) {
  const [open, setOpen] = createSignal(props.level < 1)

  const isArray = Array.isArray(props.value)
  const isObject = props.value?.constructor.name === 'Object'
  const isExpandableNode = isArray || isObject

  return (
    <div class="ml-2">
      <Show when={isExpandableNode}>
        {/* TODO
          - remove flex and " "
          - implement display all divs on same line and add " "
        */}
        <span class="flex cursor-pointer" onClick={() => setOpen(!open())}>
          <span class="text-purple-300 select-none">{open() ? '▼ ' : '▶ '}</span>

          <Show when={props.isObjectItem}>
            <span class="text-blue-300">{props.keyName}</span>

            <span class="text-gray-400">{': '}</span>
          </Show>

          <span class="text-gray-500">
            {isArray ? (open() ? '[' : '[ … ]') : (open() ? '{' : '{ … }')}
          </span>
        </span>

        <Show when={open()}>
          <div class="ml-1 border-l border-gray-600 pl-2 mt-1">
            <Show when={isArray}>
              <For each={props.value}>
                {(item, i) => (
                  <JsonNode
                    keyName={null}
                    value={item}
                    level={props.level + 1}
                    isObjectItem={false}
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
                    isObjectItem={true}
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
        <span class="flex">
          <Show when={props.isObjectItem}>
            <span class="text-blue-300">{props.keyName}</span>

            <span class="text-gray-400">{': '}</span>
          </Show>

          <span class="text-green-300">
            {typeof props.value === 'string'
              ? <RenderText text={props.value} />
              : props.value?.constructor.name === 'Date'
                ? props.value.toISOString()
                : props.value}
          </span>

          <Show when={!props.isLast}>
            <span class="text-gray-500">,</span>
          </Show>
        </span>
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
