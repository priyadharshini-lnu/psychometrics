import {
  useCallback, useEffect, ReactNode, useState,
} from 'react'
import { Skeleton } from 'antd'
import { useResources } from '~/hooks/useResources'
import { useTableSettings } from '~/components/AdminShell/useTableSettings'
import { ResourceContext, ResourceColumnShape } from './ResourceContext'

import { BaseMeta, Options } from '~/hooks/useResources/interfaces'
import { Table } from './Table'
import { Column } from './Column'
import { Filter } from './Filter'
import type { TableSettingsKey } from './settingsKeys'

type Props<R, M = BaseMeta> = {
  children: ReactNode
  header?: ReactNode
  name: string
  settingsKey: TableSettingsKey
  title: string
  config: Options<R[], M>
}

const ResourceComponent = <R extends {id: string}, M extends BaseMeta>({
  children,
  header,
  config,
  name,
  settingsKey,
  title,
}: Props<R, M>) => {
  const resource = useResources<R, M>(name, config)
  const [firstFetchCompleted, setFirstFetchCompleted] = useState(false)
  // Held here because the table publishes it and the filter reads it, and neither can see the other.
  const [columns, setColumns] = useState<ResourceColumnShape[]>([])
  const { settings, save } = useTableSettings(settingsKey)

  const hideColumns = useCallback((keys: string[]) => { save({ hiddenColumns: keys }) }, [save])

  useEffect(() => { resource.fetch().finally(() => setFirstFetchCompleted(true)) }, [])

  return (
    <ResourceContext.Provider
      value={{
        resource,
        title,
        columns,
        publishColumns: setColumns,
        hiddenColumns: settings.hiddenColumns,
        hideColumns,
      }}
    >
      {header}
      {firstFetchCompleted ? children : <Skeleton active className="mt-4 mb-4" />}
    </ResourceContext.Provider>
  )
}

ResourceComponent.Table = Table
ResourceComponent.Column = Column
ResourceComponent.Filter = Filter

export const Resource = ResourceComponent
