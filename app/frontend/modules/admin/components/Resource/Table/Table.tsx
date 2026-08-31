import _ from 'lodash'
import {
  FC, Children, ReactElement, ReactNode, useEffect,
} from 'react'
import { Table as AntTable } from 'antd'
import type { GetProp, TableProps } from 'antd'
import { useBreakpoint, visibleColumns, DataTableDisplayButton } from '@thetalententerprise/glint'
import type { DataTableColumnToggle } from '@thetalententerprise/glint'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResourceContext, ResourceColumnShape } from '../ResourceContext'
import { Column } from '../Column'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'

const { I18n } = window

type Props = {
  children: React.ReactNode[]
  pagination?: boolean
  onRowChange?: (record: Record<string, unknown>) => React.HTMLAttributes<HTMLElement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expandable?: GetProp<TableProps<any>, 'expandable'>
  embedded?: boolean
}

type ColumnStatics = {
  id: string
  title?: ReactNode | ((...args: never[]) => ReactNode)
  hideable?: boolean
}

const shapeOf = ({
  id, title, hideable,
}: ColumnStatics): ResourceColumnShape => ({
  key: id,
  label: typeof title === 'function' ? null : title,
  hideable: hideable !== false,
})

// Static only: `Children.toArray` is a fresh list every render.
const signatureOf = (shapes: ResourceColumnShape[]) => JSON.stringify(shapes.map(({
  key, label, hideable,
}) => [key, typeof label === 'string' ? label : '', hideable]))

export const Table: FC<Props> = ({
  pagination, children, expandable, onRowChange, embedded,
}) => {
  const arrayChildren = Children.toArray(children).filter(Boolean) as ReactElement[]
  arrayChildren.forEach((c) => {
    if (c?.type !== Column) throw new Error('Only Resource.Column is supported inside Resource.Table')
  })

  const {
    resource, title, columns: publishedColumns, publishColumns, hiddenColumns, hideColumns,
  } = useResourceContext()
  const tableLoading = resource.isLoading('fetch')
  const screens = useBreakpoint()

  const shapes = arrayChildren.map(child => shapeOf(child.props))
  const signature = signatureOf(shapes)
  useEffect(() => { publishColumns(shapes) }, [signature, publishColumns])

  const columns = arrayChildren.map((c) => {
    let innerProps = { ...c.props, key: c.props.id }
    if (!innerProps.render && !innerProps.dataIndex) {
      innerProps.dataIndex = _.camelCase(innerProps.id)
    }
    if (c.props.sorter) {
      innerProps = { ...innerProps, sortOrder: resource.getSortOrder(innerProps.id) }
    }
    // Below md a pinned column would eat the whole viewport, leaving nothing to scroll.
    if (!screens.md && innerProps.fixed) {
      innerProps = { ...innerProps, fixed: undefined }
    }
    return innerProps
  })

  const toggles: DataTableColumnToggle[] = publishedColumns
    .filter(column => column.hideable && column.label != null)
    .map(({ key, label }) => ({ key, label, visible: !hiddenColumns.includes(key) }))

  const handleToggle = (key: string) => hideColumns(
    hiddenColumns.includes(key) ? hiddenColumns.filter(hidden => hidden !== key) : [...hiddenColumns, key],
  )

  const getRowProps = (record: Record<string, unknown>) => ({
    ...getTenantRowAttributes(record),
    ...(onRowChange?.(record) || {}),
  })

  const InnerTable = (
    <AntTable
      rowKey={row => row?.id ?? -1}
      dataSource={resource.data}
      pagination={false}
      loading={embedded && tableLoading}
      onRow={getRowProps}
      scroll={{ x: 'max-content' }}
      expandable={expandable}
      onChange={resource.handleTableChange}
      columns={visibleColumns(columns, hiddenColumns)}
      sticky
    />
  )

  return (
    <TableLayout
      table={InnerTable}
      disableHeader
      title={title}
      embedded={embedded}
      loading={tableLoading}
      recordCount={resource.meta.recordCount}
      controls={toggles.length > 0 ? (
        <DataTableDisplayButton
          columns={toggles}
          onToggle={handleToggle}
          label={I18n.t('admin.table_display_columns')}
        />
      ) : undefined}
      requestStatus={resource.requests.fetch?.status}
      failureMsg={getErrorMsgFromJsonApiRequests(resource.requests)}
      pagination={pagination ? {
        page: resource.currentPage,
        pageSize: resource.pageSize,
        total: resource.meta.recordCount ?? 0,
        onChange: resource.changePage,
      } : undefined}
    />
  )
}
