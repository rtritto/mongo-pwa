import { createSignal, For, Show, onMount } from 'solid-js'

const isObject = (value: any) =>
  value && typeof value === 'object' && !Array.isArray(value)

function JsonNode(props: { keyName: string; value: any; level: number }) {
  const [open, setOpen] = createSignal(props.level < 1) // auto espandi livello 0

  return (
    <div class="ml-4">
      <Show when={isObject(props.value)}>
        <div class="cursor-pointer" onClick={() => setOpen(!open())}>
          <span class="text-purple-300">{open() ? "▼ " : "▶ "}</span>
          <span class="text-blue-300">{props.keyName}</span>
          <span class="text-gray-500">
            {Array.isArray(props.value) ?
              (open() ? " [" : " [ … ]") :
              (open() ? " {" : " { … }")}
          </span>
        </div>
        <Show when={open()}>
          <div class="ml-4 border-l border-gray-600 pl-2 mt-1">
            <For each={Object.entries(props.value)}>
              {([k, v]) => (
                <JsonNode keyName={k} value={v} level={props.level + 1} />
              )}
            </For>
          </div>
        </Show>
      </Show>
      <Show when={!isObject(props.value)}>
        <div>
          <span class="text-blue-300">{props.keyName}</span>
          <span class="text-gray-400">: </span>
          <span class="text-green-300">{JSON.stringify(props.value)}</span>
        </div>
      </Show>
    </div>
  )
}

export function JsonViewer(props: { data: any }) {
  // let mounted = false

  // onMount(() => {
  //   mounted = true
  // })

  return (
    <div class="font-mono text-sm bg-gray-900 text-white p-4 rounded-xl shadow overflow-auto max-h-[80vh]">
      {/* <Show when={mounted}> */}
      <For each={Object.entries(props.data)}>
        {([k, v]) => <JsonNode keyName={k} value={v} level={0} />}
      </For>
      {/* </Show> */}
      {/* <Show when={!mounted}> */}
      {/* <div class="text-gray-500 italic">Caricamento JSON...</div>
      </Show> */}
    </div>
  )
}
