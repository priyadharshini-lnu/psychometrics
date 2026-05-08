import { ColumnProps } from 'antd/es/table'

interface Props<T> extends ColumnProps<T> {
  id: string
  sortingKey?: string
}


// We don't render this component, it's turned into Ant `Table.Column` inside `Table` component
// file app/frontend/modules/admin/components/Resource/Table/Table.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Column<T> (_: Props<T>) {
  return null
}
