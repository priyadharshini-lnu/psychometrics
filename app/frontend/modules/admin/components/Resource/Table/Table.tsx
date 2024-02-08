import _ from 'lodash'
import { FC, Children, ReactElement } from 'react'
import { Table as AntTable, Pagination } from 'antd'
import { ExpandableConfig } from 'antd/lib/table/interface'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResourceContext } from '../ResourceContext'
import { Column } from '../Column'

const { Column: AntColumn } = AntTable

type Props = {
  children: React.ReactNode[]
  pagination?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expandable?: ExpandableConfig<any>
}

export const Table: FC<Props> = ({
  pagination, children, expandable,
}) => {
  const arrayChildren = Children.toArray(children).filter(Boolean) as ReactElement[]
  arrayChildren.forEach((c) => {
    if (c?.type !== Column) throw new Error('Only Resource.Column is supported inside Resource.Table')
  })

  const { resource } = useResourceContext()
  const tableLoading = resource.isLoading('fetch')

  const InnerTable = (
    <AntTable
      rowKey={row => row?.id ?? -1}
      dataSource={resource.data}
      pagination={false}
      loading={tableLoading}
      expandable={expandable}
      onChange={resource.handleTableChange}
    >
      {arrayChildren.map((c) => {
        let innerProps = { ...c.props, key: c.props.id }
        if (!innerProps.render && !innerProps.dataIndex) {
          innerProps.dataIndex = _.camelCase(innerProps.id)
        }
        if (c.props.sorter) {
          innerProps = { ...innerProps, sortOrder: resource.getSortOrder(innerProps.id) }
        }
        return <AntColumn {...innerProps} />
      })}
    </AntTable>
  )
  return (
    <>
      <TableLayout
        table={InnerTable}
        disableHeader
        recordCount={resource.meta.recordCount}
        loading={tableLoading}
        requestStatus={resource.requests.fetch?.status}
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
