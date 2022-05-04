import { useClient } from 'jsonapi-react'
import { useState } from 'react'
import * as t from 'io-ts'
import { isRight } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import { useDispatch } from 'react-redux'
import { setResponseDataMismatched } from 'modules/admin/core/request'
interface Requests {
  [key: string]: {
    status: 'loading' | 'failed' | 'success',
    errors?: { [key: string]: string }[] | null
  }
}

export interface ResourceState<D, M> {
  data: D,
  requests: Requests,
  meta: M
}

interface ApiConfig {
  include?: string[],
  page?: {
    number?: number,
    size?: number
  },
  filter?: {
    [key: string]: string
  },
  sort?: string[]
}
interface Options<R, M> {
  apiConfig?: ApiConfig,
  stateManager?: {
    setState: (state: ResourceState<R, M>) => void,
    state: ResourceState<R, M>
  },
  responseType?: any,
}

interface BaseMeta {
  record_count?: number,
  page_count?: number,
}

export function useResources<R extends {id: string, type: string }, M extends BaseMeta = BaseMeta>(resourceName, options: Options<R[], M> = {}) {
  const { apiConfig, stateManager, responseType } = options
  const client = useClient()
  const dispatch = useDispatch()

  let state: ResourceState<R[], M>, setState
  if (stateManager) {
    state = stateManager?.state
    setState = stateManager.setState
  } else {
    [state, setState] = useState<ResourceState<R[], M>>({ data: [], requests: {}, meta: {} as M })
  }

  const { data, requests, meta } = state

  const setRequests = (requests: Requests) => {
    setState({ ...state, requests })
  }

  const setData = (data: R[]) => {
    setState({ ...state, data: data })
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
    const { data: response, meta, error, errors } = await client.fetch<R[]>([resourceName, apiConfig || {}])
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, fetch: { status, errors: errorData } })

    if (status === 'success' && response) {
      setState({ ...state, data: response,  meta: meta })
      if (args.responseType || responseType) {
        responseTypeValidation(t.array(args.responseType || responseType), response)
      }
    }
  }

  const addResource = async (details: Partial<R>, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    setRequests({ ...requests, add: { status: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, apiConfig], details)
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
    const { data: response, error, errors } = await client.mutate<R>([resourceName, id, apiConfig], attributes)
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
    const { data: response, error,  errors } = await client.delete([resourceName, id, apiConfig])
    const errorData = errors ? errors : (error ? [error] : null)
    const status = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { status, errors: errorData } })

    if (status === 'success') {
      setData(data.filter(r => r.id !== id))
      responseTypeValidation(args?.responseType || responseType, response)
    }
  }

  const getErrors = (action, resource_id = null) => {
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
    isLoading,
    getErrors,
  }
}
