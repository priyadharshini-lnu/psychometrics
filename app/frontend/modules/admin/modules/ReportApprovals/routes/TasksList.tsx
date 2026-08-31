import React, { useCallback, useEffect, useState } from 'react'
import {
  Table, Space, Button, Checkbox, Menu, Input, Flex,
  message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { ResourceType } from '~/modules/admin/components/UserSavedFilters/core'
import { useSavedFilter } from '~/modules/admin/components/UserSavedFilters'
import dayjs from '~/utils/dayjs'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { get as getCurrentUser } from '~/core/currentUser'
import { Campaign, Task, TasksTR } from '../core'
import { Tabs } from './Tabs'
import { DocumentTitle } from '~/components/DocumentTitle'
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
type Props = PropsFromRedux & Omit<ReturnType<typeof useResources<Task>>, 'fetch'> & { type?: 'myTasks' | 'approved' }

type FilterOption = {id: string, name: string}
type FilterOptions = {
  campaigns: FilterOption[],
  reports: FilterOption[],
  approvers: FilterOption[],
  qcUsers: FilterOption[],
}

const searchFilters = ['user_full_name_cont', 'user_email_cont']

const TasksListComponent: React.FC<Props> = ({
  data, setData, meta, isLoading, getSortOrder, handleTableChange, changePage, type,
  currentPage, pageSize, changeFilter, getFilteredValue, requests, changeUrlQuery, appliedQuery, collectionAction,
}) => {
  const tableLoading = isLoading('fetch')
  const { collectionAction: search } = useResources<Campaign>('report_approvals')

  const [filterOptions, setFilterOptions] = useState<FilterOptions>()

  function getResourceTypeFromPathname (type?: string): ResourceType {
    switch (type) {
      case 'myTasks':
        return ResourceType.ReportApprovalMyTasks
      case 'approved':
        return ResourceType.ReportApprovalApproved
      default:
        return ResourceType.ReportApprovalAll
    }
  }

  const resourceType = getResourceTypeFromPathname(type)

  const {
    handleFilterChange,
    FilterComponent,
  } = useSavedFilter(changeFilter, changeUrlQuery, resourceType, filterOptions)


  useEffect(() => {
    const metadataFilters: { [key: string]: string } = {}

    if (type === 'myTasks') {
      metadataFilters.my_tasks = 'true'
    } else if (type === 'approved') {
      metadataFilters.approval_status_in = 'approved'
    }

    if (!filterOptions) {
      search({
        action: 'metadata_for_filters',
        method: 'get',
        apiConfig: {
          filter: metadataFilters,
        },
      }).then((data: FilterOptions) => {
        setFilterOptions(data)
      })
    }
  }, [search, filterOptions, type])

  const typedValue = (key?: string): string => (
    key == null ? '' : [getFilteredValue(key) ?? ''].flat().join('')
  )

  // Two keys in one write: changeFilter builds each new URL from the same snapshot, so the second drops the first.
  const applyFilters = (changes: Record<string, string | string[] | null>) => {
    const filter = { ...appliedQuery?.filter }
    Object.entries(changes).forEach(([key, value]) => {
      if (value == null || value.length === 0) delete filter[key]
      else filter[key] = value
    })

    changeUrlQuery({ ...appliedQuery, filter, page: { number: 1, size: appliedQuery?.page?.size } })
  }

  const filterProps = (
    resource:string, query:string, filter: string, val: string | string[] = '', values?: FilterOption[],
    textFilter?: string,
  ) => ({
    // antd only remembers a selection its own confirm() committed, so the dropdown reads the applied filter back.
    filterDropdown: ({ close, visible }) => {
      const [items, setItems] = useState<MenuItem[]>([])
      const [searchQuery, setSearchQuery] = useState<string>('')
      const [selectedKeys, setSelectedKeys] = useState<string[]>([])

      const applied = [val].flat().filter(value => value !== '')
      const text = typedValue(textFilter)

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

      const getResetDisabled = () => selectedKeys.length === 0 && searchQuery === ''

      // handleFilterChange writes a cleared key straight to the URL, so the two-key write has to land last.
      const filterOk = (close) => {
        const picked = selectedKeys.length ? selectedKeys : null

        if (searchFilters.includes(filter)) {
          changeFilter(filter, searchQuery || null)
          handleFilterChange(filter, searchQuery || null)
        } else if (textFilter) {
          handleFilterChange(filter, searchQuery ? null : picked)
          handleFilterChange(textFilter, searchQuery || null)
          applyFilters(searchQuery
            ? { [filter]: null, [textFilter]: searchQuery }
            : { [filter]: picked, [textFilter]: null })
        } else {
          changeFilter(filter, picked)
          handleFilterChange(filter, picked)
        }
        close()
      }

      const filterReset = (close) => {
        if (textFilter) {
          handleFilterChange(filter, null)
          handleFilterChange(textFilter, null)
          applyFilters({ [filter]: null, [textFilter]: null })
        } else {
          changeFilter(filter, null)
          handleFilterChange(filter, null)
        }

        setSearchQuery('')
        setSelectedKeys([])
        close()
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
        if (!visible) return

        setSelectedKeys(applied)
        setSearchQuery(searchFilters.includes(filter) ? applied.join('') : text)
      }, [visible, applied.join(','), text])

      useEffect(() => {
        initItems(values)
      }, [values, initItems])

      return (
        <div className={styles.container}>
          <div className={styles.search}>
            <Input
              prefix={<SearchOutlined />}
              className={styles.input}
              placeholder={I18n.t('common.actions.search')}
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
              onClick={() => filterReset(close)}
            >
              {I18n.t('common.actions.reset')}
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => filterOk(close)}
            >
              {searchFilters.includes(filter) || (textFilter && searchQuery)
                ? I18n.t('common.actions.search')
                : I18n.t('common.actions.done')}
            </Button>
          </div>
        </div>
      )
    },
    filtered: !!(val?.length || typedValue(textFilter).length),
    filterIcon: searchFilters.includes(filter) ? <SearchOutlined /> : null,
  })

  const [selected, setSelected] = useState<string[]>([])

  const selectAll = (checked) => {
    if (!checked) { return setSelected([]) }

    const ids = data.filter(({ allowQcBulkSubmit, allowBulkApprove }) => (
      (type === 'myTasks' && (allowQcBulkSubmit || allowBulkApprove)) || (type === 'approved' && allowBulkApprove)
    )).map(({ id }) => id)
    setSelected(ids)
  }

  const select = (id) => {
    setSelected([...selected, id])
  }

  const unselect = (id) => {
    setSelected(selected.filter(i => i !== id))
  }

  const submitAll = () => {
    collectionAction({
      action: 'bulk_approve',
      method: 'post',
      body: { ids: selected },
      responseType: TasksTR,
      apiConfig: {
        include: ['campaign', 'report', 'user', 'approver_user', 'qc_user'],
        fields: {
          users: ['name', 'email'],
          campaigns: ['name'],
          reports: ['name'],
        },
      },
    }).then((response: (Task[] & {responseMeta: { approved: number, ignored: number, qc_completed: number } })) => {
      const newData = data.map(reportApproval => response.find(ra => ra.id === reportApproval.id) || reportApproval)
        .filter(reportApproval => reportApproval.approvalStatus !== 'approved')
      setData(newData)
      const { responseMeta } = response
      message.success(I18n.t('admin.report_approval_bulk_approve_success',
        {
          approved: responseMeta.approved,
          ignored: responseMeta.ignored,
          sent_for_approval: responseMeta.qc_completed,
        }))

      setSelected([])
    })
  }

  const TasksTable = (
    <>
      <FilterComponent />
      {type === 'myTasks' && (
        <Flex justify="end" align="center" className="m-5">
          <Button type="primary" onClick={submitAll} disabled={!selected.length}>
            {I18n.t('admin.report_approval_submit_or_approve_all')}
          </Button>
        </Flex>
      )}
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        sticky
      >
        {type === 'myTasks' && (
          <Column
            title={<Checkbox onChange={e => selectAll(e.target.checked)} />}
            fixed="left"
            render={({ id, allowQcBulkSubmit, allowBulkApprove }) => {
              if (allowQcBulkSubmit || allowBulkApprove) {
                return (
                  <Checkbox
                    checked={selected.includes(id)}
                    onChange={e => (e.target.checked ? select(id) : unselect(id))}
                  />
                )
              }
              return null
            }}
          />
        )}
        <Column
          title={I18n.t('shared.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
          fixed="left"
          minWidth={100}
        />
        <Column
          title={I18n.t('admin.report_approval_columns_campaign_name')}
          dataIndex={['campaign', 'name']}
          key="campaign_name"
          {...filterProps(
            'campaign', 'campaign_id_in', 'campaign_id_in',
            getFilteredValue('campaign_id_in'), filterOptions?.campaigns, 'campaign_name_cont',
          )}
          width={300}
        />
        <Column
          title={I18n.t('admin.report_approval_columns_report_name')}
          dataIndex={['report', 'name']}
          key="report_name"
          {...filterProps(
            'report', 'report_id_in', 'report_id_in',
            getFilteredValue('report_id_in'), filterOptions?.reports, 'report_name_cont',
          )}
          width={300}
        />
        <Column
          title={I18n.t('admin.report_approval_columns_user_name')}
          dataIndex={['user', 'name']}
          key="user_name"
          {...filterProps(
            'user', 'full_name_cont', 'user_full_name_cont',
            getFilteredValue('user_full_name_cont'),
          )}
          width={200}
        />
        <Column
          title={I18n.t('admin.report_approval_columns_user_email')}
          dataIndex={['user', 'email']}
          key="user_email"
          {...filterProps(
            'user', 'email_cont', 'user_email_cont',
            getFilteredValue('user_email_cont'),
          )}
          width={300}
        />
        <Column
          title={I18n.t('admin.report_approval_columns_approval_status')}
          key="approvalStatus"
          {...filterProps(
            '', 'approval_status_in', 'approval_status_in',
            getFilteredValue('approval_status_in'), [
              { id: 'not_ready', name: I18n.t('admin.report_approval_approval_statuses_not_ready') },
              { id: 'pending_qc', name: I18n.t('admin.report_approval_approval_statuses_pending_qc') },
              { id: 'qc_in_progress', name: I18n.t('admin.report_approval_approval_statuses_qc_in_progress') },
              { id: 'qc_completed', name: I18n.t('admin.report_approval_approval_statuses_qc_completed') },
              {
                id: 'change_requested',
                name: I18n.t('admin.report_approval_approval_statuses_change_requested'),
              },
              { id: 'approved', name: I18n.t('admin.report_approval_approval_statuses_approved') },
            ],
          )}
          render={({ approvalStatus }) => I18n.t(`admin.report_review_statuses_${approvalStatus}`)}
          minWidth={200}
        />
        <Column
          width={150}
          title={I18n.t('admin.report_approval_columns_qc_by')}
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
          title={I18n.t('admin.report_approval_columns_approved_by')}
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
          title={I18n.t('shared.actions')}
          key="link"
          render={({
            id, campaign, projectId, pdfUrl, approvalStatus,
          }) => (
            <Space>
              <Link to={`/admin/projects/${projectId}/new_campaigns/${campaign.id}/user_reports/${id}`}>
                {I18n.t('admin.report_approval_review')}
              </Link>
              {approvalStatus === 'approved' && pdfUrl && (
                <a href={pdfUrl}>
                  {I18n.t('shared.download')}
                </a>
              )}
            </Space>
          )}
          fixed="right"
          minWidth={150}
        />
      </Table>
    </>
  )

  return (
    <>
      <DocumentTitle text={I18n.t('admin.report_approvals')} />
      <Tabs />
      <div>
        <TableLayout
          loading={tableLoading}
          table={TasksTable}
          title={I18n.t('admin.report_approvals')}
          pagination={{
            page: currentPage,
            pageSize,
            total: meta.recordCount ?? 0,
            onChange: changePage,
          }}
          recordCount={meta.recordCount}
          requestStatus={requests.fetch?.status}
          failureMsg={getErrorMsgFromJsonApiRequests(requests)}
        />
      </div>
    </>
  )
}

export const TasksList = connecter(TasksListComponent)
