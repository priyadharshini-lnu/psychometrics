import _ from 'lodash'
import { FC, Children, ReactElement } from 'react'
import { Table as AntTable, Pagination } from 'antd'
import { ExpandableConfig } from 'antd/es/table/interface'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResourceContext } from '../ResourceContext'
import { Column } from '../Column'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { useWindowSize } from '~/hooks/useWindowSize'
import { getTenantRowAttributes } from '~/utils/tableRowTenantAttributes'

type Props = {
  children: React.ReactNode[]
  pagination?: boolean
  onRowChange?: (record: Record<string, unknown>) => React.HTMLAttributes<HTMLElement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expandable?: ExpandableConfig<any>
}

export const Table: FC<Props> = ({
  pagination, children, expandable, onRowChange,
}) => {
  const arrayChildren = Children.toArray(children).filter(Boolean) as ReactElement[]
  arrayChildren.forEach((c) => {
    if (c?.type !== Column) throw new Error('Only Resource.Column is supported inside Resource.Table')
  })

  const { resource } = useResourceContext()
  const tableLoading = resource.isLoading('fetch')
  const { width: windowWidth } = useWindowSize()

  const columns = arrayChildren.map((c, index) => {
    let innerProps = { ...c.props, key: c.props.id }
    if (!innerProps.render && !innerProps.dataIndex) {
      innerProps.dataIndex = _.camelCase(innerProps.id)
    }
    if (c.props.sorter) {
      innerProps = { ...innerProps, sortOrder: resource.getSortOrder(innerProps.id) }
    }
    if (windowWidth > 800 && (index === 0 || index === 1)) {
      innerProps = { ...innerProps, fixed: 'left' }
    } else if (index === arrayChildren.length - 1 && windowWidth > 800) {
      innerProps = { ...innerProps, fixed: 'right' }
    }
    return innerProps
  })

  const getRowProps = (record: Record<string, unknown>) => ({
    ...getTenantRowAttributes(record),
    ...(onRowChange?.(record) || {}),
  })

  const InnerTable = (
    <AntTable
      rowKey={row => row?.id ?? -1}
      dataSource={resource.data}
      pagination={false}
      loading={tableLoading}
      onRow={getRowProps}
      scroll={{ x: 'max-content' }}
      expandable={expandable}
      onChange={resource.handleTableChange}
      columns={columns}
      sticky
    />
  )

  return (
    <>
      <TableLayout
        table={InnerTable}
        disableHeader
        recordCount={resource.meta.recordCount}
        loading={tableLoading}
        requestStatus={resource.requests.fetch?.status}
        failureMsg={getErrorMsgFromJsonApiRequests(resource.requests)}
      />
      {pagination && (
        <Pagination
          current={resource.currentPage}
          pageSize={resource.pageSize}
          total={resource.meta.recordCount}
          onChange={resource.changePage}
          className="pl"
        />
      )}
    </>
  )
}
