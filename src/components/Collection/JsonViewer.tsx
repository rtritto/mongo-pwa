import { createSignal, For, Match, Show, Switch, untrack, type Component } from 'solid-js'

// 36 is the max length of a UUID string
const MAX_LEN = 36

const RenderLongText: Component<{ text: string }> = (props) => {
  // On click expand/collapse long text
  const [expanded, setExpanded] = createSignal(false)

  const displayLongTextValue = () => expanded()
    ? props.text
    : props.text.slice(0, MAX_LEN) + '…'

  return (
    <span
      class={`cursor-pointer${expanded() ? ' break-all' : ''} whitespace-nowrap`}
      title={props.text}
      onClick={() => setExpanded(!expanded())}
    >
      {displayLongTextValue()}
    </span>
  )
}

const RenderText: Component<{ text: string }> = (props) => {
  return (
    <Switch fallback={<RenderLongText text={props.text} />}>
      {/* Image/Audio/Video inline preview */}
      <Match when={props.text.startsWith('data:')}>
        <Switch fallback={<span>"{props.text}"</span>}>
          <Match when={props.text.startsWith('data:image')}>
            <img src={props.text} alt="inline image" />
          </Match>

          <Match when={props.text.startsWith('data:audio')}>
            <audio controls src={props.text} />
          </Match>

          <Match when={props.text.startsWith('data:video')}>
            <video controls><source src={props.text} /></video>
          </Match>
        </Switch>
      </Match>

      <Match when={props.text.length <= MAX_LEN}>
        <span>{props.text}</span>
      </Match>
    </Switch>
  )
}

const JsonNode: Component<{
  keyName: string | null
  value: any
  level: number
  isObjectItem?: boolean
  isLast: boolean
}> = (props) => {
  const [open, setOpen] = createSignal(untrack(() => props.level < 1))

  const isArray = Array.isArray(untrack(() => props.value))
  const isObject = untrack(() => props.value?.constructor.name === 'Object')
  const isExpandableNode = isArray || isObject

  const displayValue = () => {
    if (typeof props.value === 'number')
      return <span class="text-cyan-300">{props.value}</span>
    if (typeof props.value === 'string')
      return <span class="text-green-300"><RenderText text={props.value} /></span>
    if (typeof props.value === 'boolean')
      return <span class="text-yellow-300">{props.value.toString()}</span>
    if (props.value === null)
      return <span class="text-gray-400">null</span>
    return props.value
  }

  return (
    <div class="ml-2">
      <Show
        when={isExpandableNode}
        fallback={
          <span>
            <Show when={props.isObjectItem}>
              <span class="text-blue-300">{props.keyName}</span>

              <span class="text-gray-400">{': '}</span>
            </Show>

            {displayValue()}

            <Show when={!props.isLast}>
              <span class="text-gray-500">,</span>
            </Show>
          </span>
        }
      >
        {/* (?) TODO remove " " */}
        <span class="cursor-pointer" onClick={() => setOpen(!open())}>
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
                    isLast={i() === Object.entries(props.value).length - 1}
                    isObjectItem
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
    </div>
  )
}

const JsonViewer: Component<{ value: any }> = (props) => {
  return (
    <div class="font-mono text-sm bg-gray-900 text-white p-2.5 rounded-xl shadow overflow-auto">
      <JsonNode keyName={null} value={props.value} level={0} isLast={true} />
    </div>
  )
}

export default JsonViewer
