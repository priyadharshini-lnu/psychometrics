import React, { useState } from 'react'
import {
  Table, Space, Pagination, Button, Checkbox, List, AutoComplete,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { SearchOutlined } from '@ant-design/icons'
import _ from 'lodash'
import dayjs from '~/utils/dayjs'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { get as getCurrentUser } from '~/core/currentUser'
import { Campaign, User } from '../core'

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
  const { collectionAction: search } = useResources<Campaign>('report_approvals')

  const filterProps = (
    resource:string, query:string, filter: string, val: string | string[] = '', values?: string[],
  ) => {
    const [value, setValue] = useState<string|string[]>(val)
    const [options, setOptions] = useState<{ value: string }[]>([])

    const onChange = (v) => {
      setValue(v)
      searchResource(v)
    }

    const searchResource = (value) => {
      search({
        action: `search_${resource}`,
        method: 'get',
        apiConfig: {
          filter: {
            [query]: value,
          },
        },
      }).then((data: Campaign[] | User[]) => {
        setOptions((data).map(
          c => ({ id: c.id, value: query === 'email_cont' ? c.email : c.name }),
        ))
      })
    }
    return {
      filterDropdown: ({ confirm }) => (
        <div style={{ padding: 8 }}>
          {values
            ? (
              <List
                dataSource={values}
                bordered={false}
                renderItem={v => (
                  <List.Item>
                    <Space>
                      <Checkbox
                        onChange={({ target: { checked } }) => {
                          const active = value || []
                          setValue(checked ? [...active, v] : (active as []).filter(val => val !== v))
                        }}
                        checked={_.includes(value, v)}
                      />
                      {I18n.t(`administration.report_review.statuses.${v}`)}
                    </Space>
                  </List.Item>
                )}
              />
            )
            : (
              <AutoComplete
                options={options}
                onChange={onChange}
                value={value}
                style={{ marginBottom: 8, display: 'block' }}
              />
            )
            }
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
              onClick={() => {
                confirm({ closeDropdown: true })
                changeFilter(filter, value)
              }}
            >
              {I18n.t('common.actions.search')}
            </Button>
            <Button
              onClick={() => {
                changeFilter(filter, null)
                setValue('')
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
    }
  }

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
          {...filterProps('campaign', 'name_cont', 'campaign_name_cont', getFilteredValue('campaign_name_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.report_name')}
          dataIndex={['report', 'name']}
          key="report_name"
          {...filterProps('report', 'name_cont', 'report_name_cont', getFilteredValue('report_name_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_name')}
          dataIndex={['user', 'name']}
          key="user_name"
          {...filterProps('user', 'full_name_cont', 'user_full_name_cont', getFilteredValue('user_full_name_cont'))}
          width={200}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_email')}
          dataIndex={['user', 'email']}
          key="user_email"
          {...filterProps('user', 'email_cont', 'user_email_cont', getFilteredValue('user_email_cont'))}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.approval_status')}
          key="approvalStatus"
          {...filterProps('', 'approval_status_in', 'approval_status_in',
            getFilteredValue('approval_status_in'), [
              'not_ready', 'pending_qc', 'qc_in_progress', 'qc_completed', 'change_requested', 'approved',
            ])}
          render={({ approvalStatus }) => I18n.t(`administration.report_review.statuses.${approvalStatus}`)}
        />
        <Column
          width={150}
          title={I18n.t('administration.report_approval.columns.qc_by')}
          key="qcBy"
          render={({ qcUser, qcAt }) => (
            <>
              <div>{qcUser?.name}</div>
              {qcAt && (
              <div>
                {dayjs(qcAt).format('DD MM YYYY / hh:mm')}
              </div>
              )}
            </>
          )}
        />
        <Column
          width={150}
          title={I18n.t('administration.report_approval.columns.approved_by')}
          key="approvedBy"
          render={({ approverUser, approvedAt }) => (
            <>
              <div>{approverUser?.name}</div>
              {approvedAt && (
              <div>
                {dayjs(approvedAt).format('DD MM YYYY / hh:mm')}
              </div>
              )}
            </>
          )}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.actions')}
          key="link"
          render={({
            id, campaign, projectId, pdfUrl, approvalStatus,
          }) => (
            <Space>
              <a href={`/admin/projects/${projectId}/new_campaigns/${campaign.id}/user_reports/${id}`}>
                {I18n.t('administration.report_approval.review')}
              </a>
              {approvalStatus === 'approved' && pdfUrl && (
                <a href={pdfUrl}>
                  {I18n.t('administration.report_approval.download')}
                </a>
              )}
            </Space>
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
        failureMsg={getErrorMsgFromJsonApiRequests(requests)}
      />
    </>
  )
}

export const TasksList = connecter(TasksListComponent)
