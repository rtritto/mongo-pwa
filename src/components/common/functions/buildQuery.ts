const buildQuery = (object: { [key: string]: unknown }): string => {
  const query = []
  for (const key in object) {
    query.push(`${key}=${object[key]}`)
  }
  return query.join('&')
}

export default buildQuery
