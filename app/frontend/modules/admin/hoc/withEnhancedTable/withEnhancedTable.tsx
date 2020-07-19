import React, { useEffect } from 'react'
import _ from 'lodash'
import { TableConfig, State as TableConfigs } from 'modules/admin/core/filterAndPagination/interfaces'
import {
  changeFilterType,
  removeFilterType,
  changePageType,
  changeSortType,
  initTableType,
} from 'modules/admin/core/filterAndPagination/actions'

const ORDER_MAPPING = {
  asc: 'ascend',
  desc: 'descend',
}

interface Props {
  sort: SortProps
  tables: TableConfigs
  changeFilter: changeFilterType
  removeFilter: removeFilterType,
  changePage: changePageType
  changeSort: changeSortType
  initTable: initTableType
}

interface SortProps {
  column: string
  order: string
}

interface SorterProps {
  columnKey: string
  order?: string
}

interface PropsPassed extends Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTableChange(_pagination: any, _filter: any, sorter: SorterProps): void
  getSortOrder(column: string): 'ascend' | 'descend'
  tableConfig: TableConfig
  maintainHistory: boolean
}

interface Options {
  maintainHistory: boolean
}

const withEnhancedTable = (WrappedComponent, tableName: string, options: Options) => (
  (props: Props) => {
    const { changeSort, initTable, tables } = props
    const tableConfig = tables[tableName]

    useEffect(() => {
      initTable(tableName, options.maintainHistory)
    }, [])

    if (!tableConfig) { return null }

    const handleTableChange = (_pagination, _filter, sorter: SorterProps) => {
      const { columnKey, order } = sorter
      let newOrder: string

      // order is not returned by antd if we toggle the sort order of allready selected column
      if (order) {
        newOrder = _.findKey(ORDER_MAPPING, (v: string) => v === order)
      } else {
        newOrder = tableConfig.sort.order === 'asc' ? 'desc' : 'asc'
      }

      changeSort(tableName, columnKey, newOrder)
    }

    const getSortOrder = (column: string): false | 'ascend' | 'descend' => {
      if (tableConfig.sort.columnName !== column) { return false }

      return tableConfig.sort.order && ORDER_MAPPING[tableConfig.sort.order]
    }

    let tableFunctions = _.pick(props, ['changeFilter', 'changePage', 'removeFilter', 'changeSort'])
    tableFunctions = _.reduce(tableFunctions, (result, func, key) => {
      result[key] = _.curry(func)(tableName)

      return result
    }, {})

    const { maintainHistory } = options

    if (tableConfig.initialized) {
      return (
        <WrappedComponent
          {...props}
          {...tableFunctions}
          maintainHistory={maintainHistory}
          tableConfig={tables[tableName]}
          onTableChange={handleTableChange}
          getSortOrder={getSortOrder}
        />
      )
    }

    return null
  }
)

export default withEnhancedTable
