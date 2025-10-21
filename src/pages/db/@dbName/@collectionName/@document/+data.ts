import { connectClient } from '@/server/db'
import { toString } from '@/utils/bson'
import { buildId } from '@/utils/mappers/mapUtils'
import { isValidCollectionName, isValidDatabaseName } from '@/utils/validationsClient'

export const data: DataAsync<DataDocument> = async (pageContext) => {
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
  const { config: { options }, mongo } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)

  const subtype = 'subtype' in pageContext.urlParsed.search ? Number(pageContext.urlParsed.search.subtype) : undefined
  // (?) TODO add decodeURIComponent(document)
  const _id = buildId(document, subtype)

  const doc = await collection.findOne({ _id })

  // TODO handle 404 not found

  return {
    title: `${options.readOnly ? 'Viewing' : 'Editing'} Document: ${document}`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    docString: toString(doc!),
    _id: document,
    subtype,
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: document,
    success: undefined,
    warning: undefined,
    error: undefined
  } as DataDocument
}
