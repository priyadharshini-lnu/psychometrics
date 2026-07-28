import _ from 'lodash'
import humps from 'humps'
import { StringMap } from '@thetalententerprise/jsonapi-react'
import { devtools } from 'zustand/middleware'
import { create } from 'zustand'
import {
  BaseMeta, ResourceState, StateManager, Requests, RequestType,
} from './interfaces'

const { I18n } = window
interface Error {
  [key: string]: string[] | string
}

interface JsonApiStandardError {
  title: string
  detail?: string
  source: {
    pointer: string,
  }
}

interface Schema {
  relationships?: {
    [key: string]: {
      association?: 'hasOne' | 'hasMany'
      singularName?: string
    }
  }
}

export const convertJsonApiErrors = (errors: StringMap, schema: Schema |null = null): Error => {
  const attributePrefix = '/data/attributes/'
  const relationshipPrefix = '/data/relationships/'

  return errors.reduce((acc, error: JsonApiStandardError) => {
    const pointer = error.source?.pointer
    let attribute: string

    const relationshipFieldName = (relationshipName: string) => {
      const relationship = schema?.relationships?.[relationshipName]
      if (!relationship) return null

      const association = relationship.association || 'hasOne'
      if (association === 'hasOne') return `${relationshipName}Id`

      const hasManyFieldName = relationship.singularName || relationshipName
      return `${hasManyFieldName}Ids`
    }

    if (pointer === undefined || pointer === '/data') {
      acc.base ||= []
      acc.base = [...acc.base, { title: error.title, detail: error.detail }]
      return acc
    }

    if (pointer.startsWith(attributePrefix)) {
      attribute = pointer.replace(attributePrefix, '')
      const mappedAttribute = relationshipFieldName(attribute)
      if (mappedAttribute) attribute = mappedAttribute
    } else if (pointer.startsWith(relationshipPrefix)) {
      const [relationshipName] = pointer.replace(relationshipPrefix, '').split('/')

      if (schema) {
        attribute = relationshipFieldName(relationshipName) || relationshipName
      } else {
        attribute = relationshipName
      }
    } else {
      attribute = pointer
    }

    acc[attribute] = { title: error.title, detail: error.detail }

    return acc
  }, {})
}

export const formatErrors = (errors: StringMap | undefined, schema: Schema) => {
  if (errors === undefined) return null
  if (errors.status === '500') return { base: I18n.t('errors.error_500') }

  errors = [errors].flat().map((error) => {
    const pointer = error.source?.pointer ? humps.camelize(error.source.pointer) : null
    const modifiedError = { ...error }
    if (pointer) { modifiedError.source = { pointer } }

    return modifiedError
  })
  return convertJsonApiErrors(errors, schema)
}

export const defaultState = <D, M extends BaseMeta = BaseMeta>() => ({
  data: [] as unknown as D, requests: {}, meta: {} as M, query: {},
} as ResourceState<D, M>)

export const createZutandStoreForJsonApi = <D, M extends BaseMeta = BaseMeta>(name: string) => (
  create<StateManager<D, M>>()(
    devtools(
      set => ({
        state: defaultState<D, M>(),
        setState: (arg: ResourceState<D, M> | ((state: ResourceState<D, M>) => ResourceState<D, M>)) => {
          set(store => (typeof arg === 'function' ? { ...store, state: arg(store.state) } : { ...store, state: arg }))
        },
      }),
      { name },
    ),
  )
)

export const getErrorMsgFromJsonApiRequests = (requests: Requests, requestType: RequestType = 'fetch'): string => {
  const errors = requests[requestType]?.errors
  if (!errors) {
    return ''
  }
  const errorTitle = _.get(errors, '[0].base[0].title') || ''
  const errorDescription = _.get(errors, '[0].base[0].detail') || ''

  return errorTitle + errorDescription
}
