import { connect } from 'react-redux'
import {
  changeFilter, changePage, removeFilter, changeSort, initTable,
} from 'admin/filterAndPagination/actions'
import { getTables } from 'admin/filterAndPagination/selectors'

export default connect(
  state => ({
    tables: getTables(state),
  }),
  dispatch => ({
    changeFilter: (tableName: string, filterName: string, filterValue: string) => (
      dispatch(changeFilter(tableName, filterName, filterValue))
    ),
    changePage: (tableName: string, pageNumber: number) => dispatch(changePage(tableName, pageNumber)),
    removeFilter: (tableName: string, filterName: string) => dispatch(removeFilter(tableName, filterName)),
    changeSort: (tableName: string, columnName: string, order: string) => (
      dispatch(changeSort(tableName, columnName, order))
    ),
    initTable: (tableName: string, maintainHistory: boolean) => dispatch(initTable(tableName, maintainHistory)),
  }),
)
