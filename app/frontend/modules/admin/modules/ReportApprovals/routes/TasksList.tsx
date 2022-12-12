import React from 'react'
import {
  Table, Input, Space, Pagination, Button,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { TableLayout } from 'modules/admin/components/TableLayout'
import { get as getCurrentUser } from 'core/currentUser'
import { RootState } from 'modules/admin/core/rootReducers'
import { useResources } from 'hooks/useResources'
import { SearchOutlined } from '@ant-design/icons'

const { Column } = Table
const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & Omit<ReturnType<typeof useResources>, 'fetch'>

const TasksListComponent: React.FC<Props> = ({
  data, meta, isLoading, getSortOrder, handleTableChange, changePage,
  currentPage, pageSize, changeFilter, getFilteredValue, requests,
}) => {
  const tableLoading = isLoading('fetch')

  const filterProps = (filter: string, value = '') => ({
    filterDropdown: ({
      selectedKeys, confirm, setSelectedKeys,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          defaultValue={value}
          value={selectedKeys[0]}
          onPressEnter={() => changeFilter(filter, selectedKeys[0])}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
            onClick={() => {
              confirm({ closeDropdown: false })
              changeFilter(filter, selectedKeys[0])
            }}
          >
            {I18n.t('common.actions.search')}
          </Button>
          <Button
            onClick={() => {
              changeFilter(filter, null)
              setSelectedKeys([])
            }}
            size="small"
            style={{ width: 90 }}
          >
            {I18n.t('common.actions.reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: () => <SearchOutlined style={{ color: value ? '#1BAF99' : undefined }} />,
  })

  const TasksTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.campaign_name')}
          dataIndex={['campaign', 'name']}
          key="campaign_name"
          {...filterProps('campaign_name_cont', getFilteredValue('campaign_name_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.report_name')}
          dataIndex={['report', 'name']}
          key="report_name"
          {...filterProps('report_name_cont', getFilteredValue('report_name_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_name')}
          dataIndex={['user', 'name']}
          key="user_name"
          {...filterProps('user_full_name_cont', getFilteredValue('user_full_name_cont'))}
          width={200}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_email')}
          dataIndex={['user', 'email']}
          key="user_email"
          {...filterProps('user_email_cont', getFilteredValue('user_email_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.approval_status')}
          key="approvalStatus"
          render={({ approvalStatus }) => I18n.t(`administration.report_review.statuses.${approvalStatus}`)}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.actions')}
          key="link"
          render={({
            id, campaign, projectId,
          }) => (
            <a href={`/administration/projects/${projectId}/new_campaigns/${campaign.id}/user_reports/${id}`}>
              {I18n.t('administration.report_approval.review')}
            </a>
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  return (
    <>
      <TableLayout
        table={TasksTable}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
      />
    </>
  )
}

export const TasksList = connecter(TasksListComponent)
