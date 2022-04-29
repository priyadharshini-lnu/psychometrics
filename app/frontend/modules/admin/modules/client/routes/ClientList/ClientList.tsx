import React, { FC, useEffect, useState } from 'react'
import { useQuery, useMutation, useClient } from 'jsonapi-react'
import * as t from 'io-ts'

type Props = {}


function useResources<R extends {id: string, type: string }>(resourceName, config = {}) {
  const client = useClient(config)
  const [data, setData] = useState<R[]>([])
  const [requests, setRequests] = useState({})

  return {
    fetch: async (args = {}) => {
      setRequests({ ...requests, fetch: { state: 'loading'} })
      const { data: newData, error, errors } = await client.fetch(resourceName, args)
      const errorData = errors ? errors : (error ? [error] : null)
      const state = errorData ? 'failed' : 'completed'
      setRequests({ ...requests, fetch: { state: state, errors: errorData } })

      if (state === 'completed') setData(newData)
    },
    addResource: async (details: Partial<R>) => {
      setRequests({ ...requests, add: { state: 'loading'} })
      const { data: response, error, errors } = await client.mutate(resourceName, details)
      const errorData = errors ? errors : (error ? [error] : null)
      const state = errorData ? 'failed' : 'completed'
      setRequests({ ...requests, add: { state: state, errors: errorData } })

      if (state === 'completed')  setData([response, ...data])
    },
    updateResource:async (details: Partial<R>) => {
      const { id, ...attributes } = details
      const requestKey = `update@${id}`
      setRequests({ ...requests, [requestKey]: { state: 'loading'} })
      const { data: response, error, errors } = await client.mutate([resourceName, id], attributes)
      const errorData = errors ? errors : (error ? [error] : null)
      const state = errorData ? 'failed' : 'completed'
      setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })

      if (state === 'completed') setData(data.map(r => r.id === response.id ? response : r))
    },
    removeResource: async (id: string) => {
      const requestKey = `delete@${id}`
      setRequests({ ...requests, [requestKey]: { state: 'loading'} })
      const { error,  errors } = await client.delete([resourceName, id])
      const errorData = errors ? errors : (error ? [error] : null)
      const state = errorData ? 'failed' : 'completed'
      setRequests({ ...requests, [requestKey]: { state: state, errors: errorData } })

      if (state === 'completed')  setData(data.filter(r => r.id !== id))
    },
    isLoading(action: string, resource_id: null | string = null): boolean {
      const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

      return request ? request.state === 'loading' : false
    },
    getErrors(action, resource_id = null) {
      const request = resource_id ? requests[`${action}@${resource_id}`] : requests[action]

      return request ? request.errors : null
    },
    data,
    setData,
    requests,
  }
}

const ResourceIdentifierTR = t.type({
  id: t.string,
  type: t.string,
})

const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
  })
])
type Client = t.TypeOf<typeof ClientTR>

export const ClientList: FC<Props> = () => {
  const { data, fetch, updateResource, isLoading, requests } = useResources<Client>('clients')

  useEffect(() => {
    fetch()
  }, [])

  return (
    <div>
      Hi
      <button onClick={() => {
        updateResource({ id: '100', name:  Math.random().toString(36).substring(2, 15) })
      }}>Update</button>
      {data?.map((client) => (<div>{client.name}</div>))}
    </div>
  )
}
