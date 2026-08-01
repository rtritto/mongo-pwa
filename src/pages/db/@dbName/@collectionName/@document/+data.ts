import { toJSString } from 'mongodb-query-parser-esm'
import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import buildId from '@/utils/mappers/buildId'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer<DataDocument>) => {
  const _data = {} as DataDocument
  if (pageContext.data.isAuthorized) {
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
    _data.title = `${pageContext.data.options.readOnly ? 'Viewing' : 'Editing'} Document: ${document}`
    _data.collections = mongo.collections[dbName]
    // TODO add env variable to set indentation spaces
    _data.docString = toJSString(doc!, '  ')!
    _data._id = document
    _data.subtype = subtype
    _data.selectedDatabase = dbName
    _data.selectedCollection = collectionName
    _data.selectedDocument = document
  }
  return _data
}
