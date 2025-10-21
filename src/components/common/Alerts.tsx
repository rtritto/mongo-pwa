import { type Component, createEffect, createSignal, onMount, Show } from 'solid-js'

const Alerts: Component<{
  data: DataLayout
}> = (props) => {
  const [success, setSuccess] = createSignal<string>()
  const [warning, setWarning] = createSignal<string>()
  const [error, setError] = createSignal<string>()

  onMount(() => {
    // Used on redirect after action
    setSuccess(localStorage.getItem('me-success') || undefined)
    localStorage.removeItem('me-success')
    setWarning(localStorage.getItem('me-warning') || undefined)
    localStorage.removeItem('me-warning')
    setError(localStorage.getItem('me-error') || undefined)
    localStorage.removeItem('me-error')
  })
  createEffect(() => {
    if (props.data.success) {
      setSuccess(props.data.success)
    }
    if (props.data.warning) {
      setWarning(props.data.warning)
    }
    if (props.data.error) {
      setError(props.data.error)
    }
  })
  return (
    <div>
      <Show when={success()}>
        <div role="alert" class="alert alert-success alert-outline mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span>{success()}</span>
        </div>
      </Show>

      <Show when={warning()}>
        <div role="alert" class="alert alert-warning alert-outline mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>

          <span>Warning: {warning()}</span>
        </div>
      </Show>

      <Show when={error()}>
        <div role="alert" class="alert alert-error alert-outline mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <span>Error: {error()}</span>
        </div>
      </Show>
    </div>
  )
}

export default Alerts
