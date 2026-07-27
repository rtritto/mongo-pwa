import { type Component, createEffect, createSignal, onMount, Show } from 'solid-js'

const ButtonClose: Component<{ onClick: () => void }> = (props) => {
  return (
    <button
      class="btn btn-ghost text-gray-500 btn-xs hover:text-gray-700"
      onClick={() => props.onClick()}
      aria-label="Close"
    >
      ✕
    </button>
  )
}

const Alerts: Component<{ data: DataLayout }> = (props) => {
  const [success, setSuccess] = createSignal<string>()
  const [warning, setWarning] = createSignal<string>()
  const [error, setError] = createSignal<string>()
  let isInitial = true

  createEffect(() => {
    const s = props.data.success
    // On initial mount, only set them if they actually exist in props
    // to prevent overwriting the localStorage flash messages with undefined.
    if (isInitial) {
      isInitial = false
      if (s) setSuccess(s)
      return
    }
    // On subsequent updates (e.g., navigating), strictly sync the state
    // so undefined correctly clears the alerts out.
    setSuccess(s)
  })
  createEffect(() => {
    const w = props.data.warning
    if (isInitial) {
      isInitial = false
      if (w) setWarning(w)
      return
    }
    setWarning(w)
  })
  createEffect(() => {
    const e = props.data.error
    if (isInitial) {
      isInitial = false
      if (e) setError(e)
      return
    }
    setError(e)
  })

  return (
    <div>
      <Show when={success()}>
        <div role="alert" class="mb-2 alert alert-outline p-1 alert-success">
          <svg xmlns="https://www.w3.org/2000/svg" class="size-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span>{success()}</span>

          <ButtonClose onClick={() => setSuccess(undefined)} />
        </div>
      </Show>

      <Show when={warning()}>
        <div role="alert" class="mb-2 alert alert-outline p-1 alert-warning">
          <svg xmlns="https://www.w3.org/2000/svg" class="size-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>

          <span>Warning: {warning()}</span>

          <ButtonClose onClick={() => setWarning(undefined)} />
        </div>
      </Show>

      <Show when={error()}>
        <div role="alert" class="mb-2 alert alert-outline p-1 alert-error">
          <svg xmlns="https://www.w3.org/2000/svg" class="size-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span>Error: {error()}</span>

          <ButtonClose onClick={() => setError(undefined)} />
        </div>
      </Show>
    </div>
  )
}

export default Alerts
