import type { TableColumnProps } from 'antd'

interface Props<T> extends TableColumnProps<T> {
  id: string
  sortingKey?: string
  hideable?: boolean
}


// We don't render this component, it's turned into Ant `Table.Column` inside `Table` component
// file app/frontend/modules/admin/components/Resource/Table/Table.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Column<T> (_: Props<T>) {
  return null
}
