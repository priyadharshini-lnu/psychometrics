import React, { useCallback, useEffect, useState } from 'react'
import {
  Table, Space, Button, Checkbox, Menu, Input, Flex,
  message, Tag,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { ResourceType } from '~/modules/admin/components/UserSavedFilters/core'
import { useSavedFilter } from '~/modules/admin/components/UserSavedFilters'
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
  currentPage, pageSize, changeFilter, getFilteredValue, requests, changeUrlQuery, appliedQuery,
  collectionAction, fetch,
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
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        sticky
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
          minWidth={100}
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
            getFilteredValue('client_id_in'), filterOptions?.clients, 'client_name_cont',
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.project')}
          dataIndex={['project', 'name']}
          key="project_name"
          {...filterProps(
            'project', 'project_id_in', 'project_id_in',
            getFilteredValue('project_id_in'), filterOptions?.projects, 'project_name_cont',
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.campaign')}
          dataIndex={['campaign', 'name']}
          key="campaign_name"
          {...filterProps(
            'campaign', 'campaign_id_in', 'campaign_id_in',
            getFilteredValue('campaign_id_in'), filterOptions?.campaigns, 'campaign_name_cont',
          )}
          width={300}
        />
        <Column
          title={I18n.t('shared.assessment')}
          dataIndex={['assessment', 'name']}
          key="assessment_name"
          {...filterProps(
            'assessment', 'assessment_id_in', 'assessment_id_in',
            getFilteredValue('assessment_id_in'), filterOptions?.assessments, 'assessment_name_cont',
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
          minWidth={150}
        />
      </Table>
    </>
  )

  return (
    <>
      <Tabs />
      <div>
        <TableLayout
          loading={tableLoading}
          table={TasksTable}
          title={I18n.t('admin.ai_scoring_approvals')}
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
