export interface State {
  [key: string]: TableConfig
}

export interface TableConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: { [key: string]: any },
  sort: {
    columnName?: string
    order?: string
  }
  page: number
  initialized?: boolean
  maintainHistory?: boolean
}
