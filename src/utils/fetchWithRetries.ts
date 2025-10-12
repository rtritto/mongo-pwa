const fetchWithRetries = async (url: string, options = {}, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)

      // Check for non-successful HTTP status codes
      if (res.ok) {
        // Successful fetch
        return res
      }
      throw new Error(`HTTP error! Status: ${res.status}`)
    } catch (error: unknown) {
      // console.error(`Attempt ${i + 1} failed: ${error}`)

      // Stop retrying if the last attempt fails
      if (i === retries - 1) {
        throw new Error(`Fetch failed after ${retries} attempts: ${error}`)
      }

      // Wait for some time before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

export default fetchWithRetries
