import { toJSString } from 'mongodb-query-parser-esm'
import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import config from '@/server/config'
import buildId from '@/utils/mappers/buildId'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer<DataDocument>) => {
  const isAuthorized = pageContext.data.isAuthorized
  if (!isAuthorized) return {}
  const { dbName, collectionName, document } = pageContext.routeParams
  const { error } = checkDatabaseCollection(dbName, collectionName)
  if (error) throw render(404, error)
  const { mongo } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection<{ _id: ReturnType<typeof buildId> }>(collectionName)
  const { searchParams } = new URL(pageContext.urlOriginal)
  const subtype = searchParams.has('subtype') ? Number(searchParams.get('subtype')) : undefined
  // (?) TODO add decodeURIComponent(document)
  const _id = buildId(document, subtype)
  const doc = await collection.findOne({ _id })
  if (!doc) throw render(404, `Document "${_id}" not found!`)
  const { options } = config
  return {
    title: `${options.readOnly ? 'Viewing' : 'Editing'} Document: ${document}`,
    collections: mongo.collections[dbName],
    // TODO add env variable to set indentation spaces
    docString: toJSString(doc!, '  ')!,
    _id: document,
    subtype,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: document
  } satisfies Partial<DataDocument>
}
