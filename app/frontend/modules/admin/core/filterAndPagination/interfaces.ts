export interface State {
  [key: string]: TableConfig
}

export interface TableConfig {
  filters: Record<string, string | string[]>,
  sort: {
    columnName?: string
    order?: string
  }
  page: number
  pageSize?: number
  initialized?: boolean
  maintainHistory?: boolean
}
