import { connectClient } from '@/server/db'
import { buildId } from '@/utils/mappers/mapUtils'
import isValidDatabaseName from '@/utils/validations/isValidDatabaseName'
import isValidCollectionName from '@/utils/validations/isValidCollectionName'
import { toJSString } from '@/utils/mongodb-query-parser'

export const data = async (pageContext: PageContextServer) => {
  const { dbName, collectionName, document } = pageContext.routeParams
  const validationDbRes = isValidDatabaseName(dbName)
  if (validationDbRes.error) {
    throw new Error(validationDbRes.error)
  }
  const { error } = isValidCollectionName(collectionName)
  if (error) {
    throw new Error(error)
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
    // TODO add env variable to set indentation spaces
    docString: toJSString(doc!, '  ')!,
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
  }
}
