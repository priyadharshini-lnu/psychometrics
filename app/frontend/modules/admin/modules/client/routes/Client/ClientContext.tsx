import React from 'react'
import { Client as ClientType } from '~/modules/admin/modules/client/core/clients'

interface ClientContextType {
  client?: ClientType
}
export const ClientContext = React.createContext({} as ClientContextType)

export const useClientContext = () => (
  React.useContext(ClientContext as unknown as React.Context<ClientContextType>)?.client
)
