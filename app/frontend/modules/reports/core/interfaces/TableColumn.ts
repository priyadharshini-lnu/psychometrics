export type TableColumn = {
[key:string]: {[key:string]: ColumnData}
}

export type ColumnData = {
  label: string,
  hide?: boolean,
  allowHide?: boolean
}

export type ColumnsHeaderData = {
  [key: string]: ColumnData
}
