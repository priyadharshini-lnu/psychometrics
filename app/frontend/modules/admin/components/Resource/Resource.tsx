import { useEffect, ReactNode, useState } from 'react'
import { Skeleton } from 'antd'
import { useResources } from '~/hooks/useResources'
import { ResourceContext } from './ResourceContext'

import { BaseMeta, Options } from '~/hooks/useResources/interfaces'
import { Table } from './Table'
import { Column } from './Column'
import { Filter } from './Filter'

type Props<R, M = BaseMeta> = {
  children: ReactNode
  name: string
  config: Options<R[], M>
}

const ResourceComponent = <R extends {id: string}, M extends BaseMeta>({
  children,
  config,
  name,
}: Props<R, M>) => {
  const resource = useResources<R, M>(name, config)
  const [firstFetchCompleted, setFirstFetchCompleted] = useState(false)

  useEffect(() => { resource.fetch().finally(() => setFirstFetchCompleted(true)) }, [])

  if (!firstFetchCompleted) return <Skeleton active className="mt-4 mb-4" />

  return <ResourceContext.Provider value={{ resource }}>{children}</ResourceContext.Provider>
}

ResourceComponent.Table = Table
ResourceComponent.Column = Column
ResourceComponent.Filter = Filter

export const Resource = ResourceComponent
