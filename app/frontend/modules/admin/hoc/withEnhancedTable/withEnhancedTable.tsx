import { useEffect } from 'react'
import pick from 'lodash/pick'
import reduce from 'lodash/reduce'
import curry from 'lodash/curry'
import forEach from 'lodash/forEach'
import { FilterValue } from 'antd/es/table/interface'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'

import { State as TableConfigs } from '~/modules/admin/core/filterAndPagination/interfaces'
import {
  changeFilterType,
  setFiltersType,
  removeFilterType,
  changePageType,
  changeSortType,
  removeSortType,
  initTableType,
} from '~/modules/admin/core/filterAndPagination/actions'

const ORDER_MAPPING = {
  asc: 'ascend',
  desc: 'descend',
}

interface Props {
  sort: SortProps
  tables: TableConfigs
  changeFilter: changeFilterType
  changeFilters: setFiltersType
  removeFilter: removeFilterType,
  changePage: changePageType
  changeSort: changeSortType
  removeSort: removeSortType
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

export interface Options {
  maintainHistory: boolean
  pageSize?: number
  filterPredicates?: Record<string, string>
}

const withEnhancedTable = (WrappedComponent, tableName: string, options: Options) => (
  (props: Props) => {
    const {
      tables, initTable, changeSort, removeSort, changeFilter, removeFilter,
    } = props

    const { maintainHistory, filterPredicates, pageSize } = options

    const tableConfig = tables[tableName]

    useEffect(() => {
      initTable(tableName, maintainHistory, pageSize || DEFAULT_PAGE_SIZE)
    }, [])

    if (!tableConfig) {
      return null
    }

    const handleTableChange = (_pagination, filters: Record<string, FilterValue | null>, sorter: SorterProps) => {
      const { columnKey, order } = sorter

      if (columnKey && order === undefined) {
        removeSort(tableName)
      }
      if (columnKey && order) {
        const mappedOrder = Object.keys(ORDER_MAPPING).find(key => ORDER_MAPPING[key] === order)
        if (mappedOrder) {
          changeSort(tableName, columnKey, mappedOrder)
        }
      }

      if (Object.keys(filters).length && filterPredicates) {
        forEach(filters, (filterValues, columnKey) => {
          const filterPredicate = filterPredicates?.[columnKey] ?? ''
          const filterWithPredicate = `${columnKey}${filterPredicate}`

          if (filterValues === null) {
            removeFilter(tableName, filterWithPredicate)
          } else if (filterPredicate === 'Eq') {
            changeFilter(tableName, filterWithPredicate, filterValues[0])
          } else {
            changeFilter(tableName, filterWithPredicate, filterValues)
          }
        })
      }
    }

    const getSortOrder = (column: string): false | 'ascend' | 'descend' => {
      if (tableConfig.sort.columnName !== column) { return false }

      return tableConfig.sort.order && ORDER_MAPPING[tableConfig.sort.order]
    }

    const getFilteredValue = (column: string): FilterValue | null | undefined => {
      const filterPredicate = filterPredicates?.[column] ?? ''
      const filterWithPredicate = `${column}${filterPredicate}`
      const filterValue = tableConfig.filters[filterWithPredicate]

      if (filterValue) {
        return Array.isArray(filterValue) ? filterValue : [filterValue]
      }

      return null
    }

    let tableFunctions = pick(props, ['changeFilter', 'changeFilters', 'changePage', 'removeFilter', 'changeSort'])
    tableFunctions = reduce(tableFunctions, (result, func, key) => {
      result[key] = curry(func)(tableName)
      return result
    }, {} as typeof tableFunctions)

    if (tableConfig.initialized) {
      return (
        <WrappedComponent
          {...props}
          {...tableFunctions}
          maintainHistory={maintainHistory}
          tableConfig={tables[tableName]}
          onTableChange={handleTableChange}
          getSortOrder={getSortOrder}
          getFilteredValue={getFilteredValue}
        />
      )
    }

    return null
  }
)

export default withEnhancedTable
