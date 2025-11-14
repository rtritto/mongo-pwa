const getColumnsAndSetDocs = (docs: MongoDocument[]) => {
  const columns = [] as string[][]

  for (const i in docs) {
    const currentColumns = Object.keys(docs[i])
    columns.push(currentColumns)
    // Used by DELETE document
    docs[i].sub_type = docs[i]._id.sub_type as number | undefined
  }

  const noDuplicateColumns = columns.flat().filter((value, index, arr) => arr.indexOf(value) === index)  // Remove duplicates
  const underscoreFields = []
  const regularFields = []
  for (const col of noDuplicateColumns) {
    if (col.startsWith('_')) {
      underscoreFields.push(col)
    } else {
      regularFields.push(col)
    }
  }

  return {
    columns: [...underscoreFields.toSorted(), ...regularFields.toSorted()],
    docs
  }
}

export default getColumnsAndSetDocs
