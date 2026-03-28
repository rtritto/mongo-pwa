import { docToString } from './mapUtils'

const getColumnsAndSetDocs = (docs: MongoDocument[]) => {
  const columns = [] as string[][]

  for (const i in docs) {
    const currentColumns = Object.keys(docs[i])
    columns.push(currentColumns)
    // Vike use JSON.stringify that remove some info (sub_type, _idString) from the _id field

    // Used by DELETE document
    docs[i].sub_type = docs[i]._id.sub_type as number | undefined

    // Convert values to string to display
    for (const col of currentColumns) {
      docs[i][col] = docToString(docs[i][col])
    }
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
