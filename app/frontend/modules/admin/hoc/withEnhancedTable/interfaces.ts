import { FilterValue } from 'antd/lib/table/interface'

import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'

export interface TableProps {
  tableConfig: TableConfig
  changeFilter(filterName: string, filterValue: string): void
  removeFilter(filterName: string): void
  removeAllFilters(tableName: string): void
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  getFilteredValue(column: string): FilterValue | null | undefined
  changePage(page: number): void
}
