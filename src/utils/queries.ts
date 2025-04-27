import { Binary } from 'bson'
import type { Sort, SortDirection } from 'mongodb'

import { parseObjectId, toSafeBSON } from './bson'

interface QueryOptions {
  limit: number
  projection?: {
    [field: string]: number
  }
  skip?: number
  sort?: Sort
  allowDiskUse?: boolean
}
interface StageMatch { $match: MongoDocument }
interface StageSort { $sort: Sort }
interface StageLimit { $limit: number }
interface StageSkip { $skip: number }
interface StageFacet { $facet: { data: Pipeline } }
interface StageProject {
  $project: {
    'metadata.total': { $size: string }
    data: { $slice: [string, number] }
  }
}
type Stage = StageMatch | StageSort | StageLimit | StageSkip | StageFacet | StageProject
type Pipeline = (MongoDocument | Stage)[]

/** @param sort example: sort=field1:1,field2:0 */
export const getSort = (sort: string): Sort => {
  if (sort) {
    const outSort: Sort = {}
    const sorts = sort.split(',')
    for (const qp in sorts) {
      const [sortField, sortType] = qp.split(':')
      outSort[sortField] = +sortType as SortDirection
    }
    return outSort
  }
  return {}
}

export const getProjection = (projection: string) => {
  return toSafeBSON(projection)
}

export const getQueryOptions = (query: QueryParameter): QueryOptions => {
  const queryOptions: QueryOptions = {
    limit: globalThis.config.options.documentsPerPage
  }
  if (query.sort) {
    queryOptions.sort = getSort(query.sort)
  }
  if (query.page) {
    queryOptions.skip = (+query.page - 1) * queryOptions.limit
  }
  if (query.projection) {
    queryOptions.projection = getProjection(query.projection)
  }
  return queryOptions
}

const converters = {
  // If type == J, convert value as json document
  J(value: string) {
    return JSON.parse(value)
  },
  // If type == N, convert value to number
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  N(value: string) {
    return Number(value)
  },
  // If type == O, convert value to ObjectId
  O(value: string) {
    return parseObjectId(value)
  },
  // If type == R, convert to RegExp
  R(value: string) {
    return new RegExp(value, 'i')
  },
  U(value: string) {
    return new Binary(Buffer.from(value.replaceAll('-', ''), 'hex'), Binary.SUBTYPE_UUID)
  },
  // if type == S, no conversion done
  S(value: string) {
    return value
  }
}

/*
 * Builds the Mongo query corresponding to the
 * Simple/Advanced parameters input.
 * Returns {} if no query parameters were passed in request.
 */
export const getQuery = (query: QueryParameter): MongoDocument | Pipeline => {
  const { key, value } = query
  if (key && value) {
    // if it is a simple query

    // 1. fist convert value to its actual type
    const { type } = query
    if (type) {
      const realType = type.toUpperCase()
      if (realType in converters) {
        const realValue = converters[realType as keyof typeof converters](value)

        // 2. then set query to it
        return { [key]: realValue }
      }
    }
    throw new Error(`Invalid query type: ${type}`)
  }
  const { query: jsonQuery } = query
  if (jsonQuery) {
    // if it is a complex query, take it as is
    const result = toSafeBSON(jsonQuery)
    if (result) {
      return result as Pipeline
    }
    throw new Error('Query entered is not valid')
  }
  return {}
}

const getBaseAggregatePipeline = (pipeline: Pipeline, queryOptions: QueryOptions): Pipeline => {
  const baseAggregatePipeline = [...pipeline]
  const { sort, projection } = queryOptions
  if (sort) {
    baseAggregatePipeline.push({ $sort: sort })
  }
  if (projection) {
    baseAggregatePipeline.push({ $project: projection })
  }
  return baseAggregatePipeline
}

export const getSimpleAggregatePipeline = (query: MongoDocument, queryOptions: QueryOptions): Pipeline => {
  const pipeline = Object.keys(query).length > 0 ? [{ $match: query }] : []
  const simpleAggregatePipeline = getBaseAggregatePipeline(pipeline, queryOptions)
  // https://stackoverflow.com/a/24161461/10413113
  const { limit, skip = 0 } = queryOptions
  if (skip === 0) {
    simpleAggregatePipeline.push({ $limit: limit })
  } else {
    simpleAggregatePipeline.push(
      { $limit: limit + skip },
      { $skip: skip }
    )
  }
  return simpleAggregatePipeline
}

export const getComplexAggregatePipeline = (pipeline: Pipeline, queryOptions: QueryOptions): Pipeline => {
  return [
    { $facet: { data: getBaseAggregatePipeline(pipeline, queryOptions) } },
    {
      $project: {
        'metadata.total': { $size: '$data' },
        data: {
          $slice: [
            '$data',
            queryOptions.skip || 0,
            queryOptions.limit
          ]
        }
      }
    }
  ]
}

export const getAggregatePipeline = (pipeline: Pipeline, queryOptions: QueryOptions) => {
  // https://stackoverflow.com/a/48307554/10413113
  const aggregatePipeline = [...pipeline] as Pipeline
  const { sort, projection, limit, skip = 0 } = queryOptions
  if (sort) {
    aggregatePipeline.push({ $sort: sort })
  }
  const items = [
    { $skip: skip },
    { $limit: limit + skip }
  ] as Pipeline
  if (projection) {
    items.push({ $project: projection })
  }
  aggregatePipeline.push({
    $facet: {
      count: [{ $count: 'count' }],
      items
    }
  })
  return aggregatePipeline
}

export const getItemsAndCount = async (
  query: QueryParameter,
  queryOptions: QueryOptions,
  collection: import('mongodb').Collection<MongoDocument>,
  config: Config
) => {
  let _query = getQuery(query)
  if (query.runAggregate === 'on' && _query.constructor.name === 'Array') {
    if (_query.length > 0) {
      const queryAggregate = getAggregatePipeline(_query as Pipeline, queryOptions)
      const [{ items, count }] = await collection.aggregate<{
        items: Document[]
        count: { count: number }[]
      }>(queryAggregate, { allowDiskUse: config.mongodb.allowDiskUse }).toArray()
      return {
        items,
        count: count[0].count
      }
    }
    _query = {}
  }

  if (config.mongodb.allowDiskUse && !config.mongodb.awsDocumentDb) {
    queryOptions.allowDiskUse = true
  }

  const [items, count] = await Promise.all([
    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    collection.find(_query as MongoDocument, queryOptions).toArray(),
    // TODO maybe replace count with countDocuments
    // Read related discussion on https://github.com/mongo-express/mongo-express/issues/1518
    collection.count(_query as MongoDocument)
  ])
  return {
    items,
    count
  }
}

export const getLastPage = (pageSize: number, totalCount: number): number => {
  // Float to Integer
  // result is 5 for:
  // - x=5
  // - 5<x<5.5
  // - 5.5<=x<6
  const result = Math.floor(totalCount / pageSize)

  return totalCount % pageSize
    ? result + 1
    : result
}
