import { connect } from 'react-redux'
import {
  changeFilter, changePage, removeFilter, changeSort, initTable, removeSort, removeAllFilters,
} from '~/modules/admin/core/filterAndPagination/actions'
import { getTables } from '~/modules/admin/core/filterAndPagination/selectors'

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
