const getColumnsAndSetDocs = (docs: MongoDocument[]) => {
  const columns = [] as string[][]

  for (const i in docs) {
    const currentColumns = Object.keys(docs[i])
    columns.push(currentColumns)
    // Used by DELETE document
    docs[i].sub_type = docs[i]._id.sub_type as number | undefined
  }

  return {
    columns: columns.flat()
      .filter((value, index, arr) => arr.indexOf(value) === index),  // Remove duplicates
    docs
  }
}

export default getColumnsAndSetDocs
