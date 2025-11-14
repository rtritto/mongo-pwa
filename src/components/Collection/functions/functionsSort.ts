/* Sort initial order: ascending (true) | descending (false) | none (null) */
export const getInitialColumnsHeader = (columns: string[], query: QueryParameter) => {
  const header: { [key: string]: boolean | null } = {}

  for (const column of columns) {
    header[column] = null
  }

  if (query.sort) {
    const splittedSort = query.sort.split(',')
    for (const sortParam of splittedSort) {
      if (sortParam[0] === '-') {
        header[sortParam.slice(1)] = false
      } else {
        header[sortParam] = true
      }
    }
  }

  return header
}

/* Sort order: ascending (true) > descending (false) > none (null) > ascending (true) */
export const getNextSort = (columnHeader: boolean | null) => {
  switch (columnHeader) {
    case null: {
      return true
    }
    case true: {
      return false
    }
  }
  return null
}

export const removeColumnFromSortQp = (sortQp: string, column: string) => {
  return sortQp.split(',').filter((col) => {
    const cleanCol = col.replace(/^\-/, '')
    return cleanCol !== column
  }).join(',')
}
