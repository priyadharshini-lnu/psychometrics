import React, { useCallback, useEffect, useState } from 'react'
import {
  Table, Space, Pagination, Button, Checkbox, Menu, Input,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import SearchOutlined from '@ant-design/icons/SearchOutlined'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import dayjs from '~/utils/dayjs'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { get as getCurrentUser } from '~/core/currentUser'
import { Campaign } from '../core'
import { Tabs } from './Tabs'
import styles from './TasksList.less'

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

type FilterOption = {id: string, name: string}
type FilterOptions = {
  campaigns: FilterOption[],
  reports: FilterOption[],
  approvers: FilterOption[],
  qcUsers: FilterOption[],
}

const searchFilters = ['user_full_name_cont', 'user_email_cont']

const TasksListComponent: React.FC<Props> = ({
  data, meta, isLoading, getSortOrder, handleTableChange, changePage,
  currentPage, pageSize, changeFilter, getFilteredValue, requests,
}) => {
  const tableLoading = isLoading('fetch')
  const { collectionAction: search } = useResources<Campaign>('report_approvals')

  const [filterOptions, setFilterOptions] = useState<FilterOptions>()

  useEffect(() => {
    if (!filterOptions) {
      search({
        action: 'metadata_for_filters',
        method: 'get',
      }).then((data: FilterOptions) => {
        setFilterOptions(data)
      })
    }
  }, [search])

  const filterProps = (
    resource:string, query:string, filter: string, val: string | string[] = '', values?: FilterOption[],
  ) => ({
    filterDropdown: ({ close, setSelectedKeys, selectedKeys }) => {
      const [items, setItems] = useState<ItemType[]>([])
      const [searchQuery, setSearchQuery] = useState<string>('')

      const initItems = useCallback((payload?: FilterOption[]) => {
        if (payload && payload.length) {
          setItems(payload.map(a => ({
            key: a.id,
            label: (
              <>
                <Checkbox
                  checked={selectedKeys.includes(String(a.id))}
                  className="font-normal"
                />
                <span>{a.name}</span>
              </>
            ),
          })))
        }
      }, [selectedKeys])

      const onSelectKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
        setSelectedKeys(selectedKeys)
      }

      const getResetDisabled = () => selectedKeys.length === 0

      const filterOk = (close) => {
        if (searchQuery && searchFilters.includes(filter)) {
          changeFilter(filter, searchQuery)
        } else {
          changeFilter(filter, selectedKeys.length ? selectedKeys : null)
        }
        close()
      }

      const filterReset = () => {
        setSearchQuery('')
        setSelectedKeys([])
      }

      const handleSearch = (value: string) => {
        setSearchQuery(value)
        const newItems = values?.filter(
          item => String(item?.id)?.toLowerCase()?.includes(value.toLowerCase())
              || String(item?.name)?.toLowerCase()?.includes(value.toLowerCase()),
        )
        initItems(newItems)
      }

      useEffect(() => {
        if (val) {
          setSelectedKeys(typeof val === 'string' ? [val] : val)
        } else {
          setSelectedKeys([])
          setSearchQuery('')
        }
      }, [val])

      useEffect(() => {
        initItems(values)
      }, [values, initItems])

      return (
        <div className={styles.container}>
          <div className={styles.search}>
            <Input
              prefix={<SearchOutlined />}
              className={styles.input}
              placeholder="Search"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          {items?.length
            ? (
              <Menu
                selectable
                multiple
                onSelect={onSelectKeys}
                onDeselect={onSelectKeys}
                selectedKeys={selectedKeys}
                items={items}
              />
            ) : null
            }
          <div className={styles.buttons}>
            <Button
              type="link"
              size="small"
              disabled={getResetDisabled()}
              onClick={filterReset}
            >
              {I18n.t('common.actions.reset')}
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => filterOk(close)}
            >
              {searchFilters.includes(filter) ? I18n.t('common.actions.search') : I18n.t('common.actions.ok')}
            </Button>
          </div>
        </div>
      )
    },
    filtered: !!val?.length,
    filterIcon: searchFilters.includes(filter) ? <SearchOutlined /> : null,
  })


  const TasksTable = (
    <>
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
          fixed="left"
        />
        <Column
          title={I18n.t('administration.report_approval.columns.campaign_name')}
          dataIndex={['campaign', 'name']}
          key="campaign_name"
          {...filterProps(
            'campaign', 'campaign_id_in', 'campaign_id_in',
            getFilteredValue('campaign_id_in'), filterOptions?.campaigns,
          )}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.report_name')}
          dataIndex={['report', 'name']}
          key="report_name"
          {...filterProps(
            'report', 'report_id_in', 'report_id_in',
            getFilteredValue('report_id_in'), filterOptions?.reports,
          )}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_name')}
          dataIndex={['user', 'name']}
          key="user_name"
          {...filterProps(
            'user', 'full_name_cont', 'user_full_name_cont',
            getFilteredValue('user_full_name_cont'),
          )}
          width={200}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.user_email')}
          dataIndex={['user', 'email']}
          key="user_email"
          {...filterProps(
            'user', 'email_cont', 'user_email_cont',
            getFilteredValue('user_email_cont'),
          )}
          width={300}
        />
        <Column
          title={I18n.t('administration.report_approval.columns.approval_status')}
          key="approvalStatus"
          {...filterProps(
            '', 'approval_status_in', 'approval_status_in',
            getFilteredValue('approval_status_in'), [
              { id: 'not_ready', name: 'Not Ready' },
              { id: 'pending_qc', name: 'Pending QC' },
              { id: 'qc_in_progress', name: 'QC in Progress' },
              { id: 'qc_completed', name: 'QC Completed' },
              { id: 'change_requested', name: 'Change Requested' },
              { id: 'approved', name: 'Approved' },
            ],
          )}
          render={({ approvalStatus }) => I18n.t(`administration.report_review.statuses.${approvalStatus}`)}
        />
        <Column
          width={150}
          title={I18n.t('administration.report_approval.columns.qc_by')}
          key="qcBy"
          {...filterProps(
            '', 'qc_user_id_in', 'qc_user_id_in',
            getFilteredValue('qc_user_id_in'), filterOptions?.qcUsers,
          )}
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
          {...filterProps(
            '', 'approver_user_id_in', 'approver_user_id_in',
            getFilteredValue('approver_user_id_in'), filterOptions?.approvers,
          )}
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
          fixed="right"
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
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('administration.report_approval.dashboard'),
          },
          {
            label: () => I18n.t('administration.report_approval.report_approvals'),
          },
        ]}
      />
      <Tabs />
      <div>
        <TableLayout
          table={TasksTable}
          recordCount={meta.recordCount}
          loading={tableLoading}
          requestStatus={requests.fetch?.status}
          failureMsg={getErrorMsgFromJsonApiRequests(requests)}
        />
      </div>
    </>
  )
}

export const TasksList = connecter(TasksListComponent)
