const buildQuery = (obj: { [key: string]: unknown }): string => {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join('&')
}

export default buildQuery
