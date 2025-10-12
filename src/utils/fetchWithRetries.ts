export default async function fetchWithRetries(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 500
): Promise<Response> {
  let error: unknown

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      throw new Error(`HTTP ${res.status}`)
    } catch (error_: unknown) {
      error = error_
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * 2 ** i))
      }
    }
  }

  console.error('Fetch failed:', error)
  throw new Error('Fetch failed')
}
