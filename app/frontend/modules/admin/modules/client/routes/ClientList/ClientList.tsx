import React, { FC, useEffect, useState } from 'react'
import * as t from 'io-ts'
import { atom, AtomOptions, RecoilState, useRecoilState } from 'recoil'
import { LoadingOutlined } from '@ant-design/icons'
import { useResources, ResourceState } from 'hooks/useResources'

type Props = {}

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

const clientAtom = atom({
  key: 'Clients',
  default: { data: [], requests: {} },
});


export const ClientList: FC<Props> = () => {
  const [clients, setClients] = useRecoilState<ResourceState<Client[]>>(clientAtom)
  const { data, fetch, updateResource, isLoading, requests } = useResources<Client>(
    'clients', //{ stateManager: { state: clients, setState: setClients } }
  )

  useEffect(() => {
    fetch({ include: ['account_manager'] })
  }, [])

  return (
    <div>
      <h1>Parent</h1>
      {isLoading('update', '100') && <LoadingOutlined />}
      <button onClick={() => {
        updateResource({ id: '100', name:  Math.random().toString(36).substring(2, 15) })
      }}>Update</button>
      {data?.map((client) => (<div key={client.id}>{client.name}</div>))}
      <h1>Child</h1>
      <Client />
    </div>
  )
}

export const Client: FC<{}> = () => {
  const [clients, setClients] = useRecoilState<ResourceState<Client[]>>(clientAtom)
  const { data, fetch, updateResource, isLoading, requests, addResource } = useResources<Client>(
    'clients', { stateManager: { state: clients, setState: setClients } }
  )

  useEffect(() => {
    fetch({ include: ['account_manager', 'project_manager']})
  }, [])

  return (
    <div>
      {isLoading('update', '100') && <LoadingOutlined />}
      <button onClick={() => {
        updateResource({ id: '100', name:  Math.random().toString(36).substring(2, 15) })
      }}>Update</button>
      {data?.map((client) => (<div key={client.id}>{client.name}</div>))}
    </div>
  )
}
