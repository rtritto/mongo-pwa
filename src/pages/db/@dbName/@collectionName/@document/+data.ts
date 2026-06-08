import { render } from 'vike/abort'
import { toJSString } from 'mongodb-query-parser-esm'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import buildId from '@/utils/mappers/buildId'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer) => {
  const { dbName, collectionName, document } = pageContext.routeParams
  await connectClient()
  const { error } = checkDatabaseCollection(dbName, collectionName)
  if (error) {
    render(404, error)
  }
  const { mongo } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)

  const subtype = 'subtype' in pageContext.urlParsed.search ? Number(pageContext.urlParsed.search.subtype) : undefined
  // (?) TODO add decodeURIComponent(document)
  const _id = buildId(document, subtype)

  const doc = await collection.findOne({ _id })
  if (!doc) {
    render(404, `Document "${_id}" not found!`)
  }
  const { options } = config
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
