const getColumnsAndSetDocs = (docs: MongoDocument[]) => {
  const columns = [] as string[][]

  for (const i in docs) {
    const currentColumns = Object.keys(docs[i])
    columns.push(currentColumns)
    // JSON.stringify will remove the "sub_type" field from the _id field:
    // we need the "sub_type" to get the correct type and use DELETE document,
    // so we set it on the root of the document
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
