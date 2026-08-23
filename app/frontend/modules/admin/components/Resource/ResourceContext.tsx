import React from 'react'
import { UseResourceReturnType } from '~/hooks/useResources'
import { BaseMeta } from '~/hooks/useResources/interfaces'

export interface ResourceColumnShape {
  key: string
  label: React.ReactNode
  hideable: boolean
}

interface ResourceContextType<R extends { id: string} = {id: string }, M extends BaseMeta = BaseMeta> {
  resource: UseResourceReturnType<R, M>
  title: string
  columns: ResourceColumnShape[]
  publishColumns: (columns: ResourceColumnShape[]) => void
  hiddenColumns: string[]
  hideColumns: (keys: string[]) => void
}

export function resourceContext<R extends { id: string}, M extends BaseMeta> () {
  return React.createContext({} as ResourceContextType<R, M>)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ResourceContext = React.createContext({} as ResourceContextType<any, any>)

export const useResourceContext = <R extends { id: string}, M extends BaseMeta = BaseMeta>() => (
  React.useContext(ResourceContext as unknown as React.Context<ResourceContextType<R, M>>)
)
