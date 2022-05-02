import { useClient } from 'jsonapi-react'
import { useState } from 'react'
import * as t from 'io-ts'
import { isRight } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import { useDispatch } from 'react-redux'
import { setResponseDataMismatched } from 'modules/admin/core/request'
interface Requests {
  [key: string]: {
    state: 'loading' | 'failed' | 'success',
    errors?: { [key: string]: string }[] | null
  }
}

export interface ResourceState<D> {
  data: D,
  requests: Requests
}

interface ApiConfig {
  include?: string[],
  page?: {
    number?: number,
    size?: number
  },
  filter?: {
    [key: string]: string
  }
}
interface Options<R> {
  apiConfig?: ApiConfig,
  stateManager?: {
    setState: (state: ResourceState<R>) => void,
    state: ResourceState<R>
  },
  responseType?: any,
}


export function useResources<R extends {id: string, type: string }>(resourceName, options: Options<R[]> = {}) {
  const { apiConfig, stateManager, responseType } = options
  const client = useClient()
  const dispatch = useDispatch()

  let state: ResourceState<R[]>, setState
  if (stateManager) {
    state = stateManager?.state
    setState = stateManager.setState
  } else {
    [state, setState] = useState<ResourceState<R[]>>({ data: [], requests: {} })
  }

  const { data, requests } = state
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
    setRequests({ ...requests, fetch: { state: 'loading'} })
    const { data: response, error, errors } = await client.fetch<R[]>([resourceName, apiConfig || {}])
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, fetch: { state: state, errors: errorData } })
    if (args.responseType || responseType) {
      responseTypeValidation(t.array(args.responseType || responseType), response)
    }

    if (state === 'success' && response) setData(response)
  }

  const addResource = async (details: Partial<R>, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    setRequests({ ...requests, add: { state: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, apiConfig], details)
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, add: { state: state, errors: errorData } })
    responseTypeValidation(args?.responseType || responseType, response)

    if (state === 'success' && response)  setData([response, ...data])
  }

  const updateResource = async (details: Partial<R>, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    const { id, ...attributes } = details
    const requestKey = `update@${id}`
    setRequests({ ...requests, [requestKey]: { state: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, id, apiConfig], attributes)
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })
    responseTypeValidation(args?.responseType || responseType, response)

    if (state === 'success' && data && response) setData(data.map(r => r.id === response.id ? response : r))
  }

  const removeResource = async (id: string, args: { responseType?: any, apiConfig?: ApiConfig } = { apiConfig: apiConfig }) => {
    const requestKey = `delete@${id}`
    setRequests({ ...requests, [requestKey]: { state: 'loading'} })
    const { data: response, error,  errors } = await client.delete([resourceName, id, apiConfig])
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })
    responseTypeValidation(args?.responseType || responseType, response)

    if (state === 'success')  setData(data.filter(r => r.id !== id))
  }

  const getErrors = (action, resource_id = null) => {
    const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

    return request ? request.errors : null
  }

  const isLoading = (action: string, resource_id: null | string = null): boolean => {
    const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

    return request ? request.state === 'loading' : false
  }

  return {
    data,
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
