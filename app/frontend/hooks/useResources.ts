import { useClient } from 'jsonapi-react'
import React, { useEffect, useRef, useState } from 'react'
import * as t from 'io-ts'
import { isRight } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import { useDispatch } from 'react-redux'
import { setResponseDataMismatched } from 'modules/admin/core/request'
import { useLocation, useHistory } from 'react-router-dom'
import qs from 'qs'
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/lib/table/interface'
import { useDeepCompareEffect } from './useDeepCompareEffect'
import { useDebounce } from './useDebounce'
import isEqual from 'lodash/isEqual'
import { useMountedState } from './useMountedState'
import debounce from 'lodash/debounce'
interface Requests {
  [key: string]: {
    status: 'loading' | 'failed' | 'success',
    errors?: { [key: string]: string }[] | null
  }
}

export interface ResourceState<D, M = BaseMeta> {
  data: D,
  requests: Requests,
  meta: M,
  query: UrlQuery
}

interface UrlQuery {
  page?: {
    number?: number,
    size?: number
  },
  filter?: {
    [key: string]: string
  },
  sort?: string
}
interface ApiConfig extends UrlQuery {
  include?: string[]
}
interface Options<R, M> {
  apiConfig?: ApiConfig,
  stateManager?: {
    setState: (state: ResourceState<R, M>) => void,
    state: ResourceState<R, M>
  },
  responseType?: any,
  trackUrl?: boolean,
}

interface BaseMeta {
  record_count?: number,
  page_count?: number,
}

export function useResources<R extends {id: string, type: string }, M extends BaseMeta = BaseMeta>(resourceName, options: Options<R[], M> = {}) {
  const { apiConfig, stateManager, responseType, trackUrl } = options
  const client = useClient()
  const dispatch = useDispatch()
  const location = useLocation<any>()
  const history = useHistory()
  const queryString = qs.parse(location.search.substring(1))

  let state: ResourceState<R[], M>, setState
  if (stateManager) {
    state = stateManager?.state
    setState = stateManager.setState
  } else {
    [state, setState] = useState<ResourceState<R[], M>>({ data: [], requests: {}, meta: {} as M, query: {} })
  }

  const queryFromUrl = (trackUrl ? queryString?.['q'] || {} : {}) as UrlQuery
  const [queryState, setQueryState] = useState<UrlQuery>(queryFromUrl)
  const isMounted = useMountedState()
  const debounceQueryState = useDebounce(queryState, 300)

  useDeepCompareEffect(() => {
    if (trackUrl && !isEqual(queryState, queryFromUrl)) {
      setQueryState(queryFromUrl)
    }
  },[queryFromUrl])

  useDeepCompareEffect(() => {
    if (isMounted) fetch()
  }, [debounceQueryState])

  const { data, requests, meta } = state

  const setRequests = (requests: Requests) => {
    setState((previousState: ResourceState<R[], M>)=> ({ ...previousState, requests }))
  }

  const setData = (data: R[]) => {
    setState((previousState: ResourceState<R[], M>) => ({ ...previousState, data: data }))
  }

  const responseTypeValidation = (responseType, data) => {
    if (window.PsyGlobalState.realEnv === 'production') { return }

    if (responseType) {
      const decoded = responseType.decode(data)
      const dataIsValid = isRight(decoded)
      if (!dataIsValid) {
        const errors = PathReporter.report(responseType.decode(data))
        dispatch(setResponseDataMismatched(resourceName, errors, data))
      }
    }
  }

  const fetch = async (args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    setRequests({ ...requests, fetch: { status: 'loading'} })
    let newApiConfig = apiConfig
    if (queryState) { newApiConfig = { ...apiConfig, ...queryState } }
    const { data: response, meta, error, errors } = await client.fetch<R[]>([resourceName, newApiConfig || {}])
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, fetch: { status, errors: errorData } })

    if (status === 'success' && response) {
      setState((previousState: ResourceState<R[], M>) => ({ ...previousState, data: response,  meta: meta }))

      if (args.responseType || responseType) {
        responseTypeValidation(t.array(args.responseType || responseType), response)
      }
    }
  }

  const addResource = async (details: Partial<R>, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    setRequests({ ...requests, add: { status: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, apiConfig || {}], details)
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, add: { status, errors: errorData } })

    if (status === 'success' && response) {
      setData([response, ...data])
      responseTypeValidation(args?.responseType || responseType, response)
    }
  }

  const updateResource = async (details: Partial<R>, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    const { id, ...attributes } = details
    const requestKey = `update@${id}`
    setRequests({ ...requests, [requestKey]: { status: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, id, apiConfig || {}], attributes)
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { status, errors: errorData } })

    if (status === 'success' && data && response) {
      setData(data.map(r => r.id === response.id ? response : r))
      responseTypeValidation(args?.responseType || responseType, response)
    }
  }

  const removeResource = async (id: string, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    const requestKey = `delete@${id}`
    setRequests({ ...requests, [requestKey]: { status: 'loading'} })
    const { data: response, error,  errors } = await client.delete([resourceName, id, apiConfig || {}])
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { status, errors: errorData } })

    if (status === 'success') {
      setData(data.filter(r => r.id !== id))
      responseTypeValidation(args?.responseType || responseType, response)
    }
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
    newUrlQuery = {...queryState, sort: `${order === 'ascend' ? '' : '-'}${column}` }
    changeUrlQuery(newUrlQuery)
  }

  const changePage = (number: number, size: number) => {
    let newUrlQuery = queryState || {}
    newUrlQuery = {...queryState, page: { number, size } }
    changeUrlQuery(newUrlQuery)
  }

  const changeFilter = (name: string, value: string) => {
    let newUrlQuery = queryState || {}
    newUrlQuery = {...queryState, filter: { [name]: value  } }
    changeUrlQuery(newUrlQuery)
  }

  const removeFilter = (name: string) => {
    let newUrlQuery = queryState || {}
    let filter = queryState?.filter
    if (!filter) { return }

    const { [name]: _, ...remainingFilter } = filter
    newUrlQuery = {...queryState, filter: remainingFilter }
    changeUrlQuery(newUrlQuery)
  }

  const getFilteredValue = (name: string) => {
    return queryState?.filter?.[name]
  }

  const handleTableChange = (_pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<R>) => {
    const { columnKey, order } = sorter

    if (columnKey && order === undefined) removeSort()

    if (columnKey && order) changeSort(columnKey, order)
  }

  const getSortOrder = (column: string): undefined | 'ascend' | 'descend' => {
    if(!queryState?.sort) { return }
    if (queryState.sort === column) { return 'ascend' }
    if (queryState.sort === `-${column}`) { return 'descend' }

    return
  }

  const getErrors = (action: string, resource_id: null | string = null) => {
    const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

    return request ? request.errors : null
  }

  const isLoading = (action: string, resource_id: null | string = null): boolean => {
    const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

    return request ? request.status === 'loading' : false
  }

  return {
    data,
    meta,
    requests,
    setData,
    fetch,
    addResource,
    updateResource,
    removeResource,
    getSortOrder,
    pageSize: queryState?.page?.size || 25,
    currentPage: queryState?.page?.number ? parseInt(queryState?.page?.number as unknown as string, 10) : 1,
    changePage,
    changeFilter,
    removeFilter,
    getFilteredValue,
    handleTableChange,
    getErrors,
    isLoading
  }
}
