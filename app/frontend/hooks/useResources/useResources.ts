import { IResult, useClient } from '@thetalententerprise/jsonapi-react'
import React, { useState } from 'react'
import _ from 'lodash'
import * as t from 'io-ts'
import { isRight } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import humps from 'humps'
import qs from 'qs'
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/lib/table/interface'
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import { camelizeKeys } from '~/utils/object'
import { Schema } from '~/libs/jsonApi/schema'
import { setResponseDataMismatched } from '~/core/request'
import { useDeepCompareEffect } from '../useDeepCompareEffect'
import { useDebounce } from '../useDebounce'
import { useMountedState } from '../useMountedState'
import {
  Requests, Options, BaseMeta, ResourceState, UrlQuery, ResponseType, ApiConfig,
  RequestStatus, RequestType, CreateResource, UpdateResource, RemoveResource, HttpAction, MemberAction,
  RemoveRelationships, AddRelationship,
} from './interfaces'
import { formatErrors, defaultState } from './utils'

export function useResources<R extends {id: string}, M extends BaseMeta = BaseMeta> (
  resourceName: string, options: Options<R[], M> = {},
) {
  const {
    apiConfig, stateManager, responseType, trackUrl, basePath, initialFilter,
  } = options

  const [camelizeExcept, camelizeOnly] = [apiConfig?.camelizeExcept, apiConfig?.camelizeOnly]
  const client = useClient()
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()
  const queryString = qs.parse(location.search.substring(1))
  const schema = Schema[resourceName]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resourceUrl = basePath ? `${(client as any).config.url}/${basePath}` : (client as any).config.url
  const fetchResourceName = basePath ? `${basePath}/${resourceName}` : resourceName
  let state: ResourceState<R[], M>
  let setState
  if (stateManager) {
    // eslint-disable-next-line prefer-destructuring
    state = stateManager.state
    // eslint-disable-next-line prefer-destructuring
    setState = stateManager.setState
  } else {
    [state, setState] = useState<ResourceState<R[], M>>(defaultState<R[], M>())
  }

  const initialFilterQuery = initialFilter ? { filter: initialFilter } : {}
  const queryFromUrl = (trackUrl ? queryString?.q || initialFilterQuery
    : initialFilterQuery) as UrlQuery
  const [queryState, setQueryState] = useState<UrlQuery>(queryFromUrl)
  const isMounted = useMountedState()
  const debounceQueryState = useDebounce(queryState, 300)

  useDeepCompareEffect(() => {
    if (trackUrl && !isEqual(queryState, queryFromUrl)) {
      setQueryState(queryFromUrl)
    }
  }, [queryFromUrl])

  useDeepCompareEffect(() => {
    if (isMounted) fetch()
  }, [debounceQueryState])

  const { data, requests, meta } = state

  const setRequests = (requests: Requests) => {
    setState((previousState: ResourceState<R[], M>) => ({ ...previousState, requests }))
  }

  const setData = (data: R[]) => {
    setState((previousState: ResourceState<R[], M>) => ({ ...previousState, data }))
  }

  const setMeta = (meta: M) => {
    setState((previousState: ResourceState<R[], M>) => ({ ...previousState, meta }))
  }

  const responseTypeValidation = (responseType: ResponseType, data) => {
    if (window.PsyGlobalState.realEnv === 'production') { return }

    if (responseType) {
      const decoded = t.array(responseType).decode([data])
      const dataIsValid = isRight(decoded)
      if (!dataIsValid) {
        const errors = PathReporter.report(responseType.decode(data))
        dispatch(setResponseDataMismatched(resourceName, errors, data))
      }
    }
  }

  const getRequestStatus = (type: RequestType, errors: Record<string, unknown> | null) => (
    errors ? RequestStatus.Failed : RequestStatus.Success
  )

  const setRequestStatus = (type: RequestType, errors: Record<string, unknown> | null) => {
    const status = getRequestStatus(type, errors)
    setRequests({ ...requests, [type]: { status, errors: errors ? [errors].flat() : null } })
  }

  const fetch = async (args: { responseType?: ResponseType, apiConfig?: ApiConfig } = { apiConfig }):
    Promise<{ data: R[], meta: M }> => {
    setRequests({ ...requests, fetch: { status: RequestStatus.Loading } })
    let newApiConfig = _.merge({}, apiConfig, args.apiConfig)

    if (queryState) { newApiConfig = _.merge(newApiConfig, queryState) }

    return new Promise(async (resolve, reject) => {
      const {
        data: response, meta, error, errors,
      } = await client.fetch<R[]>([fetchResourceName, newApiConfig || {}])

      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus('fetch', formattedErrors) === RequestStatus.Success && response) {
        const camelizedResponse = camelizeKeys(response, { except: camelizeExcept, only: camelizeOnly })
        const camelizedMeta = humps.camelizeKeys(meta)
        setState((previousState: ResourceState<R[], M>) => (
          { ...previousState, data: camelizedResponse, meta: camelizedMeta }))
        resolve({ data: camelizedResponse, meta: camelizedMeta })
        if (responseType || args.responseType) {
          responseTypeValidation(t.array(args.responseType || responseType), camelizedResponse)
        }
      } else {
        reject(formattedErrors)
      }
      setRequestStatus('fetch', formattedErrors)
    })
  }

  const handleCustomMemberDeleteAction = (
    args: { id: string, action: string, updateStore?: boolean, apiConfig?: ApiConfig},
  ): Promise<void | null> => {
    const {
      id, action, apiConfig, updateStore,
    } = args
    const requestKey: RequestType = `delete/${action}@${id}`

    return new Promise(async (resolve, reject) => {
      const { error, errors } = await client.delete([resourceName, id, action, apiConfig || {}], { url: resourceUrl })
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === 'success') {
        if (updateStore) setData(data.filter(r => r.id !== id))
        resolve(null)
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const memberAction: MemberAction = (
    args: {
      id: string, action: string, method: HttpAction,
      body?: Record<string, unknown>,
      updateStore?: boolean, responseType?: ResponseType, apiConfig?: ApiConfig
    },
  ) => {
    const {
      id, action, method, body, apiConfig, updateStore,
    } = { apiConfig: options.apiConfig, ...args }
    const memberResponseType = args.responseType || options.responseType
    const requestKey: RequestType = `${method}/${action}@${id}`
    setRequests({ ...requests, [requestKey]: { status: RequestStatus.Loading } })

    if (method === 'delete') {
      return handleCustomMemberDeleteAction({
        id, action, updateStore, apiConfig,
      })
    }

    return new Promise(async (resolve, reject) => {
      let response: IResult<R> | null = null
      if (method === 'get') {
        const newApiConfig = _.merge({}, apiConfig, humps.decamelizeKeys(body || {}))
        response = await client.fetch<R>([fetchResourceName, id, action, newApiConfig || {}])
      } else {
        response = await client.mutate<R>(
          [resourceName, id, action, apiConfig || {}], humps.decamelizeKeys(body || {}),
          { url: resourceUrl },
        )
      }
      const { data, error, errors } = response
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === RequestStatus.Success) {
        if (typeof data !== 'object') {
          responseTypeValidation(memberResponseType, response)
          resolve(response)
        } else {
          const camelizedData = camelizeKeys(data || {}, { except: camelizeExcept, only: camelizeOnly })
          if (updateStore) updateIndividualRecord(camelizedData)
          resolve(camelizedData)
          responseTypeValidation(memberResponseType, camelizedData)
        }
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const collectionAction = (
    args: {
      action: string, method: HttpAction,
      body?: Record<string, unknown>,
      updateStore?: boolean, responseType?: ResponseType, apiConfig?: ApiConfig
    },
  ) => {
    const {
      action, method, body, apiConfig,
    } = { apiConfig: options.apiConfig, ...args }

    const newApiConfig = _.merge({}, apiConfig, humps.decamelizeKeys(body || {}))

    const memberResponseType = args.responseType || responseType
    const requestKey: RequestType = `${method}/${action}`
    setRequests({ ...requests, [requestKey]: { status: RequestStatus.Loading } })

    return new Promise(async (resolve, reject) => {
      let response: IResult<Record<string, string> | Record<string, string>[]> | null = null
      if (method === 'get') {
        response = await client.fetch<R>([fetchResourceName, action, newApiConfig || {}])
      } else if (method === 'delete') {
        response = await client.delete([resourceName, action, apiConfig || {}], { url: resourceUrl })
      } else {
        response = await client.mutate<R>(
          [resourceName, action, apiConfig || {}], humps.decamelizeKeys(body || {}),
          { url: resourceUrl },
        )
      }
      const { data: responseData, error, errors } = response
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === RequestStatus.Success && response) {
        if (typeof data !== 'object') {
          responseTypeValidation(memberResponseType, response)
          resolve(response)
        } else {
          const camelizedData = camelizeKeys(responseData || response, { except: camelizeExcept, only: camelizeOnly })
          resolve(camelizedData)
          if (args.updateStore && args.responseType === responseType) {
            updateIndividualRecord(camelizedData)
          }
          responseTypeValidation(memberResponseType, camelizedData)
        }
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const updateIndividualRecord = (camelizedResponse) => {
    setState((previousState: ResourceState<R[], M>) => {
      let { data } = previousState
      let updated = false
      if (data.length === 0) {
        updated = true
        data = [camelizedResponse]
      } else {
        data = previousState.data.map((resource) => {
          if (resource.id === camelizedResponse.id) {
            updated = true
            return camelizedResponse
          }
          return resource
        })
        if (!updated) data = [camelizedResponse, ...previousState.data]
      }
      return { ...previousState, data }
    })
  }

  const fetchSingle = async (
    args: { id: string, responseType?: ResponseType, apiConfig?: ApiConfig },
  ) => {
    const { apiConfig, id } = { apiConfig: options.apiConfig, ...args }
    const requestKey: RequestType = `fetch@${id}`
    setRequests({ ...requests, [requestKey]: { status: RequestStatus.Loading } })

    return new Promise(async (resolve, reject) => {
      const {
        data: response, error, errors,
      } = await client.fetch<R>([fetchResourceName, id, apiConfig || {}])

      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === RequestStatus.Success && response) {
        const camelizedResponse = camelizeKeys(response, { except: camelizeExcept, only: camelizeOnly })
        updateIndividualRecord(camelizedResponse)
        resolve(camelizedResponse)
        if (responseType || args.responseType) {
          responseTypeValidation(args.responseType || responseType, camelizedResponse)
        }
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const getResource = (id: string) => state.data.find(d => d.id === id)

  const createResource: CreateResource<R> = async (
    body, args = { apiConfig },
  ) => {
    const newApiConfig = args.apiConfig || apiConfig
    setRequests({ ...requests, add: { status: RequestStatus.Loading } })

    return new Promise(async (resolve, reject) => {
      const { data: response, error, errors } = await client.mutate<R>(
        [resourceName, newApiConfig || {}], humps.decamelizeKeys(body),
        { url: resourceUrl },
      )

      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus('add', formattedErrors) === RequestStatus.Success && response) {
        const camelizedResponse = camelizeKeys(response, { except: camelizeExcept, only: camelizeOnly })
        setData([camelizedResponse, ...data])
        if (meta.recordCount) setMeta({ ...meta, recordCount: meta.recordCount + 1 })
        resolve(camelizedResponse)
        responseTypeValidation(args?.responseType || responseType, camelizedResponse)
      } else {
        reject(formattedErrors)
      }
      setRequestStatus('add', formattedErrors)
    })
  }

  const updateResource: UpdateResource<R> = async (details, args = { apiConfig }) => {
    const { id, ...body } = details

    const requestKey: RequestType = `update@${id}`
    setRequests({ ...requests, [requestKey]: { status: 'loading' } })
    return new Promise(async (resolve, reject) => {
      const { data: response, error, errors } = await client.mutate<R>(
        [resourceName, id, apiConfig || {}], humps.decamelizeKeys(body),
        { url: resourceUrl },
      )

      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === RequestStatus.Success && data && response) {
        const camelizedResponse = camelizeKeys(response, { except: camelizeExcept, only: camelizeOnly })
        setData(data.map(r => (r.id === response.id ? camelizedResponse : r)))
        resolve(camelizedResponse)
        responseTypeValidation(args?.responseType || responseType, camelizedResponse)
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const removeResource: RemoveResource = async (id: string) => {
    const requestKey: RequestType = `delete@${id}`
    setRequests({ ...requests, [requestKey]: { status: 'loading' } })
    const { error, errors } = await client.delete([resourceName, id, apiConfig || {}], { url: resourceUrl })

    return new Promise(async (resolve, reject) => {
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === 'success') {
        setData(data.filter(r => r.id !== id))
        if (meta.recordCount) setMeta({ ...meta, recordCount: meta.recordCount - 1 })
        resolve()
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }
  const addRelationships: AddRelationship = async (resourceType, ids: string[]) => {
    const requestKey: RequestType = `addRelationships@${ids.join(',')}`
    setRequests({ ...requests, [requestKey]: { status: 'loading' } })
    const url = `${resourceUrl}/relationships`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error, errors } = await client.mutate([resourceType, ''], null as any,
      {
        body: JSON.stringify({
          data: ids.map(id => ({
            type: resourceType,
            id,
          })),
        }),
        url,
      } as {})

    return new Promise(async (resolve, reject) => {
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === 'success') {
        resolve()
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const removeRelationships: RemoveRelationships = async (resourceType, ids: string[]) => {
    const requestKey: RequestType = `removeRelationships@${ids.join(',')}`
    setRequests({ ...requests, [requestKey]: { status: 'loading' } })
    const url = `${resourceUrl}/relationships`
    const { error, errors } = await client.delete([resourceType, ''],
      {
        body: JSON.stringify({
          data: ids.map(id => ({
            type: resourceType,
            id,
          })),
        }),
        url,
        method: 'DELETE',
      } as {})

    return new Promise(async (resolve, reject) => {
      const formattedErrors = formatErrors(errors || error, schema)
      if (getRequestStatus(requestKey, formattedErrors) === 'success') {
        resolve()
      } else {
        reject(formattedErrors)
      }
      setRequestStatus(requestKey, formattedErrors)
    })
  }

  const changeUrlQuery = debounce((query: UrlQuery) => {
    const newQuery = { ...queryString, q: { ...query } }
    setQueryState(query)
    if (trackUrl) {
      history.push({ search: `?${qs.stringify(newQuery)}` })
    }
  })

  const removeSort = () => {
    if (!queryState?.sort) { return }
    const newUrlQuery = { ...queryState, sort: undefined }
    changeUrlQuery(newUrlQuery)
  }

  const changeSort = (column: React.Key, order: string) => {
    let newUrlQuery = queryState || {}
    newUrlQuery = { ...queryState, sort: `${order === 'ascend' ? '' : '-'}${column}` }
    changeUrlQuery(newUrlQuery)
  }

  const changePage = (number: number, size: number) => {
    let newUrlQuery = queryState || {}
    newUrlQuery = { ...queryState, page: { number, size } }
    changeUrlQuery(newUrlQuery)
  }

  const changeFilter = (name: string, value: string | undefined | null | string[]) => {
    if (value === '' || value === undefined || value == null) {
      return removeFilter(name)
    }
    let newUrlQuery = queryState || {}
    newUrlQuery = {
      ...queryState,
      filter: { ...queryState.filter, [name]: value },
      page: { number: 1, size: queryState.page?.size },
    }
    changeUrlQuery(newUrlQuery)
  }

  const removeFilter = (name: string) => {
    let newUrlQuery = queryState || {}
    const filter = queryState?.filter
    if (!filter) { return }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [name]: _, ...remainingFilter } = filter
    newUrlQuery = { ...queryState, filter: remainingFilter }
    changeUrlQuery(newUrlQuery)
  }

  const getFilteredValue = (name: string) => queryState?.filter?.[name]

  const handleTableChange = (
    _pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<R>,
  ) => {
    const { columnKey, order } = sorter

    if (columnKey && order === undefined) removeSort()

    if (columnKey && order) {
      const decamelizeColumnKey = humps.decamelize(columnKey)
      changeSort(decamelizeColumnKey, order)
    }

    if (!_.isEmpty(filters)) {
      _.each(filters, (filterValues, columnKey) => {
        const filterName = `${columnKey}_in`
        if (filterValues === null) {
          removeFilter(filterName)
        } else if (!_.isEqual(filterValues, queryState?.filter?.[filterName])) {
          const values = filterValues as string[]
          changeFilter(filterName, values)
        }
      })
    }
  }

  const getSortOrder = (column: string): undefined | 'ascend' | 'descend' => {
    const decamelizeColumnKey = humps.decamelize(column)
    if (!queryState?.sort) { return }
    if (queryState.sort === decamelizeColumnKey) { return 'ascend' }
    if (queryState.sort === `-${decamelizeColumnKey}`) { return 'descend' }

    return undefined
  }

  const getErrors = (action: RequestType) => {
    const request = requests[action]

    return request ? request.errors : null
  }

  const isLoading = (action: RequestType): boolean => {
    const request = requests[action]

    return request ? request.status === RequestStatus.Loading : false
  }

  const isRequestSuccessful = (action: RequestType): boolean => {
    const request = requests[action]

    return request ? request.status === RequestStatus.Success : false
  }

  return {
    data,
    meta,
    requests,
    setData,
    setMeta,
    fetch,
    fetchSingle,
    getResource,
    createResource,
    updateResource,
    removeResource,
    removeRelationships,
    getSortOrder,
    pageSize: queryState?.page?.size || 25,
    currentPage: queryState?.page?.number ? parseInt(queryState?.page?.number as unknown as string, 10) : 1,
    changePage,
    changeFilter,
    removeFilter,
    getFilteredValue,
    handleTableChange,
    getErrors,
    isLoading,
    isRequestSuccessful,
    memberAction,
    collectionAction,
    addRelationships,
  }
}
