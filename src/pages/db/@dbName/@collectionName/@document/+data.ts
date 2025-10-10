import { connectClient } from '@/server/db'
import { toString } from '@/utils/bson'
import { buildId } from '@/utils/mappers/mapUtils'
import { isValidCollectionName, isValidDatabaseName } from '@/utils/validationsClient'

export const data: DataAsync<DataCollection> = async (pageContext) => {
  const { dbName, collectionName, document } = pageContext.routeParams
  const validationDbRes = isValidDatabaseName(dbName)
  if (validationDbRes.error) {
    throw new Error(validationDbRes.error)
  }
  const validationCollRes = isValidCollectionName(collectionName)
  if (validationCollRes.error) {
    throw new Error(validationCollRes.error)
  }
  await connectClient()
  const { config, mongo } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)

  const subtype = 'subtype' in pageContext.urlParsed.search ? Number(pageContext.urlParsed.search.subtype) : undefined
  // (?) TODO add decodeURIComponent(document)
  const _id = buildId(document, subtype)

  const doc = await collection.findOne({ _id })

  // TODO handle 404 not found

  const { readOnly } = config.options
  const _data = {
    title: `${readOnly ? 'Viewing' : 'Editing'} Document: ${document}`,
    docString: toString(doc!),
    _id: document,
    subtype,
    readOnly,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: document
  } as DataDocument

  return _data
}
