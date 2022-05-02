import { useQuery, useMutation, useClient } from 'jsonapi-react'

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

interface Options<R> {
  apiConfig?: {
    include?: string[],
    page?: {
      number?: number,
      size?: number
    },
    filter?: {
      [key: string]: string
    }
  },
  stateManager?: {
    setState: (state: ResourceState<R>) => void,
    state: ResourceState<R>
  }
}

export function useResources<R extends {id: string, type: string }>(resourceName, options: Options<R[]> = {}) {
  const { apiConfig, stateManager } = options
  const client = useClient()

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

  const fetch = async (args = apiConfig) => {
    setRequests({ ...requests, fetch: { state: 'loading'} })
    const { data, error, errors } = await client.fetch<R[]>([resourceName, args || {}])
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, fetch: { state: state, errors: errorData } })

    if (state === 'success' && data) setData(data)
  }

  const addResource = async (details: Partial<R>) => {
    setRequests({ ...requests, add: { state: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>(resourceName, details)
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, add: { state: state, errors: errorData } })

    if (state === 'success' && response)  setData([response, ...data])
  }

  const updateResource = async (details: Partial<R>) => {
    const { id, ...attributes } = details
    const requestKey = `update@${id}`
    setRequests({ ...requests, [requestKey]: { state: 'loading'} })
    const { data: response, error, errors } = await client.mutate<R>([resourceName, id], attributes)
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })

    if (state === 'success' && data && response) setData(data.map(r => r.id === response.id ? response : r))
  }

  const removeResource = async (id: string) => {
    const requestKey = `delete@${id}`
    setRequests({ ...requests, [requestKey]: { state: 'loading'} })
    const { error,  errors } = await client.delete([resourceName, id])
    const errorData = errors ? errors : (error ? [error] : null)
    const state = errorData ? 'failed' : 'success'
    setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })

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
