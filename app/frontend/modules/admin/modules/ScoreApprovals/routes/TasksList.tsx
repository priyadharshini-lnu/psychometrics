import React, { useCallback, useEffect, useState } from 'react'
import {
  Table, Space, Pagination, Button, Checkbox, Menu, Input, Flex,
  message, Tag,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { ResourceType } from '~/modules/admin/components/UserSavedFilters/core'
import { useSavedFilter } from '~/modules/admin/components/UserSavedFilters'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { get as getCurrentUser } from '~/core/currentUser'
import { Campaign, Task, TasksTR } from '../core'
import { Tabs } from './Tabs'
import styles from './TasksList.less'


const { Column } = Table
const { I18n } = window

export const APPROVAL_STATUS = {
  pending: <Tag color="blue">{I18n.t('shared.pending')}</Tag>,
  assessor_approved: <Tag color="orange">{I18n.t('shared.assessor_approved')}</Tag>,
  approver_approved: <Tag color="green">{I18n.t('shared.approved')}</Tag>,
  auto_approved: <Tag color="green">{I18n.t('shared.auto_approved')}</Tag>,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {},
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux
  & ReturnType<typeof useResources<Task>>
  & { type?: 'myTasks' | 'approved', fetch: (args?: Record<string, unknown>) => Promise<unknown> }

type FilterOption = {id: string, name: string}
type FilterOptions = {
  clients: FilterOption[],
  projects: FilterOption[],
  campaigns: FilterOption[],
  assessments: FilterOption[],
  subject: FilterOption[],
}

const searchFilters = ['subject_full_name_cont', 'subject_email_cont']

const TasksListComponent: React.FC<Props> = ({
  data, meta, isLoading, getSortOrder, handleTableChange, changePage, type,
  currentPage, pageSize, changeFilter, getFilteredValue, requests, changeUrlQuery, collectionAction, fetch,
}) => {
  const tableLoading = isLoading('fetch')
  const { collectionAction: search } = useResources<Campaign>('ai_score_approvals')

  const [filterOptions, setFilterOptions] = useState<FilterOptions>()

  function getResourceTypeFromPathname (type?: string): ResourceType {
    switch (type) {
      case 'myTasks':
        return ResourceType.ScoreApprovalMyTasks
      case 'approved':
        return ResourceType.ScoreApprovalApproved
      default:
        return ResourceType.ScoreApprovalAll
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

  const filterProps = (
    resource:string, query:string, filter: string, val: string | string[] = '', values?: FilterOption[],
  ) => ({
    filterDropdown: ({ close, setSelectedKeys, selectedKeys }) => {
      const [items, setItems] = useState<MenuItem[]>([])
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
          handleFilterChange(filter, searchQuery)
        } else {
          changeFilter(filter, selectedKeys.length ? selectedKeys : null)
          handleFilterChange(filter, selectedKeys.length ? selectedKeys : null)
        }
        close()
      }

      const filterReset = (close) => {
        changeFilter(filter, null)
        handleFilterChange(filter, null)
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
              {searchFilters.includes(filter) ? I18n.t('common.actions.search') : I18n.t('common.actions.done')}
            </Button>
          </div>
        </div>
      )
    },
    filtered: !!val?.length,
    filterIcon: searchFilters.includes(filter) ? <SearchOutlined /> : null,
  })

  const [selected, setSelected] = useState<string[]>([])

  const selectAll = (checked) => {
    if (!checked) { return setSelected([]) }

    const ids = data.filter(({ allowBulkApprove }) => (
      (type === 'myTasks' && allowBulkApprove) || (type === 'approved' && allowBulkApprove)
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
        include: ['campaign', 'project', 'client', 'assessment', 'subject', 'score_assessed_by', 'score_approved_by'],
        fields: {
          users: ['name', 'email'],
          campaigns: ['name'],
          projects: ['name'],
          clients: ['name'],
          assessments: ['name'],
        },
      },
    }).then((response: (Task[] & {responseMeta: { approved: number, ignored: number, qc_completed: number } })) => {
      const { responseMeta } = response
      message.success(I18n.t('admin.scoring_approval_bulk_approve_success',
        {
          approved: responseMeta.approved,
        }))

      setSelected([])
      fetch({})
    })
  }

  const TasksTable = (
    <>
      <FilterComponent />
      {type === 'myTasks' && (
        <Flex justify="end" align="center" className="m-5">
          <Button type="primary" onClick={submitAll} disabled={!selected.length}>
            {I18n.t('admin.scoring_approval_approve_all')}
          </Button>
        </Flex>
      )}
      <Table
        rowKey={row => row?.id ?? -1}
        dataSource={data}
        pagination={false}
        loading={tableLoading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      >
        {type === 'myTasks' && (
          <Column
            title={<Checkbox onChange={e => selectAll(e.target.checked)} />}
            fixed="left"
            render={({ id, allowBulkApprove }) => {
              if (allowBulkApprove) {
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
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
          fixed="left"
        />
        <Column
          title={I18n.t('admin.report_approval_columns_subject_email')}
          dataIndex={['subject', 'email']}
          key="subject_email"
          {...filterProps(
            'subject', 'email_cont', 'subject_email_cont',
            getFilteredValue('subject_email_cont'),
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.subject')}
          dataIndex={['subject', 'name']}
          key="subject_name"
          {...filterProps(
            'subject', 'full_name_cont', 'subject_full_name_cont',
            getFilteredValue('subject_full_name_cont'),
          )}
          width={200}
        />
        <Column
          title={I18n.t('shared.client')}
          dataIndex={['client', 'name']}
          key="client_name"
          {...filterProps(
            'client', 'client_id_in', 'client_id_in',
            getFilteredValue('client_id_in'), filterOptions?.clients,
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.project')}
          dataIndex={['project', 'name']}
          key="project_name"
          {...filterProps(
            'project', 'project_id_in', 'project_id_in',
            getFilteredValue('project_id_in'), filterOptions?.projects,
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.campaign')}
          dataIndex={['campaign', 'name']}
          key="campaign_name"
          {...filterProps(
            'campaign', 'campaign_id_in', 'campaign_id_in',
            getFilteredValue('campaign_id_in'), filterOptions?.campaigns,
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.assessment')}
          dataIndex={['assessment', 'name']}
          key="assessment_name"
          {...filterProps(
            'assessment', 'assessment_id_in', 'assessment_id_in',
            getFilteredValue('assessment_id_in'), filterOptions?.assessments,
          )}
          width={300}
        />
        <Column
          width={150}
          title={I18n.t('admin.report_approval_columns_assessed_by')}
          key="assessedBy"
          render={({ scoreAssessedBy }) => (
            <>
              <div>{scoreAssessedBy?.name}</div>
            </>
          )}
        />
        <Column
          width={150}
          title={I18n.t('admin.report_approval_columns_approved_by')}
          key="approvedBy"
          render={({ scoreApprovedBy }) => (
            <>
              <div>{scoreApprovedBy?.name}</div>
            </>
          )}
        />
        <Column
          width={150}
          title={I18n.t('shared.status')}
          key="status"
          {...filterProps(
            '', 'approval_status_in', 'approval_status_in',
            getFilteredValue('approval_status_in'), [
              { id: 'pending', name: I18n.t('shared.pending') },
              { id: 'assessor_approved', name: I18n.t('shared.assessor_approved') },
              { id: 'approver_approved', name: I18n.t('shared.approved') },
              { id: 'auto_approved', name: I18n.t('shared.auto_approved') },
            ],
          )}
          render={({ approvalStatus }) => (
            <>
              {APPROVAL_STATUS[approvalStatus]}
            </>
          )}
        />
        <Column
          title={I18n.t('shared.actions')}
          key="link"
          render={({ id }) => (
            <Space>
              <Link to={`/admin/ai_scoring_approvals/${id}/review`}>
                {I18n.t('admin.report_approval_review')}
              </Link>
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
            label: () => I18n.t('admin.dashboard'),
          },
          {
            label: () => I18n.t('admin.scoring_approval_score_approvals'),
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
