import { connect } from 'react-redux'
import {
  changeFilter, changePage, removeFilter, changeSort, initTable, removeSort, removeAllFilters, setFilters,
} from '~/modules/admin/core/filterAndPagination/actions'
import { getTables } from '~/modules/admin/core/filterAndPagination/selectors'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'

type FilterInput = Record<string, string | string[] | undefined>

const applied = (filters: FilterInput): TableConfig['filters'] => (
  Object.entries(filters).reduce<TableConfig['filters']>((result, [name, value]) => {
    if (value == null || value.length === 0) return result

    return { ...result, [name]: value }
  }, {})
)

export default connect(
  state => ({
    tables: getTables(state),
  }),
  dispatch => ({
    changeFilter: (tableName: string, filterName: string, filterValue: string) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return dispatch(removeFilter(tableName, filterName))
      }
      return dispatch(changeFilter(tableName, filterName, filterValue))
    },
    changePage: (tableName: string, pageNumber: number, pageSize?: number) => (
      dispatch(changePage(tableName, pageNumber, pageSize))
    ),
    changeFilters: (tableName: string, filters: FilterInput) => dispatch(setFilters(tableName, applied(filters))),
    removeFilter: (tableName: string, filterName: string) => dispatch(removeFilter(tableName, filterName)),
    changeSort: (tableName: string, columnName: string, order: string) => (
      dispatch(changeSort(tableName, columnName, order))
    ),
    removeSort: (tableName: string) => dispatch(removeSort(tableName)),
    initTable: (tableName: string, maintainHistory: boolean, pageSize) => (
      dispatch(initTable(tableName, maintainHistory, pageSize))
    ),
    removeAllFilters: tableName => dispatch(removeAllFilters(tableName)),
  }),
)
