
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Input, Typography, Space,
} from 'antd'
import { Select } from '@thetalententerprise/glint'
import map from 'lodash/map'
import capitalize from 'lodash/capitalize'
import { useNavigate } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import { STATUSES, DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import { get as getCampaigns, fetch, FETCH } from '~/modules/admin/modules/AssessorApp/core/campaigns'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import styles from './styles.less'
import { DocumentTitle } from '~/components/DocumentTitle'

const connecter = connect(
  (state: RootState) => ({
    campaigns: getCampaigns(state),
    loading: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const { Column } = Table
const { Search } = Input
const { I18n } = window

const CampaignList: React.FC<Props> = (
  {
    campaigns: { list, total },
    loading,
    fetch,
    tableConfig: {
      filters,
      page,
    },
    tableConfig,
    changeFilter,
    removeFilter,
    onTableChange,
    getSortOrder,
    changePage,
  },
) => {
  const navigate = useNavigate()

  const statusOptions = [
    { value: 'All', label: I18n.t('admin.campaigns_filters_all') },
    ...map(STATUSES, (val: string) => ({ value: val, label: I18n.t(`admin.campaigns_filters_${val}`) })),
  ]

  useEffect(() => {
    fetch(tableConfig)
  }, [tableConfig])

  const handleStatusChange = (value: string): void => {
    if (value === 'All') { return removeFilter('statusEq') }

    changeFilter('statusEq', value)
  }

  return (
    <>
      <DocumentTitle text={I18n.t('campaign.campaigns')} />
      <TableLayout
        loading={loading}
        title={I18n.t('campaign.campaigns')}
        recordCount={total}
        pagination={{
          page,
          pageSize: DEFAULT_PAGE_SIZE,
          total,
          onChange: changePage,
          showSizeChanger: false,
        }}
        filters={(
          <Space>
            <Search
              placeholder={I18n.t('shared.search')}
              className={styles.searchInput}
              value={filters.filterableFields}
              onChange={e => changeFilter('filterableFields', e.target.value)}
            />
            <span className={styles.filterLabel}>{I18n.t('admin.campaigns_filters_status')}</span>
            <Select
              value={filters.statusEq || 'All'}
              options={statusOptions}
              onChange={handleStatusChange}
              popupMatchSelectWidth={false}
              style={{ minWidth: '200px' }}
            />
          </Space>
        )}
        table={(
          <Table
            rowKey="id"
            dataSource={list}
            onChange={onTableChange}
            pagination={false}
            scroll={{ x: 'max-content' }}
            onRow={record => ({
              onClick: () => {
                navigate(`/assessors/campaigns/${record.id}/users`)
              },
              className: styles.clickableRow,
            })}
          >
            <Column
              title={I18n.t('shared.id')}
              dataIndex="id"
              key="id"
              sorter
              sortOrder={getSortOrder('id')}
            />
            <Column
              title={I18n.t('shared.name')}
              key="name"
              minWidth={200}
              sorter
              sortOrder={getSortOrder('name')}
              render={({ name }) => (
                <Typography.Link>{name}</Typography.Link>
              )}
            />
            <Column
              title={I18n.t('admin.dates_start')}
              key="startDate"
              minWidth={150}
              sorter
              sortOrder={getSortOrder('startDate')}
              render={({ startDate }) => (startDate ? dayjs(startDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('admin.dates_end')}
              key="endDate"
              minWidth={150}
              sorter
              sortOrder={getSortOrder('endDate')}
              render={({ endDate }) => (endDate ? dayjs(endDate).format('L LT') : ' - ')}
            />
            <Column
              title={I18n.t('shared.status')}
              key="status"
              minWidth={150}
              render={({ status }) => capitalize(status)}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_status')}
              key="completion_status"
              minWidth={150}
              render={({ evaluationCompletionStatus }) => (
                I18n.t(`admin.assessor_campaigns_statuses_${evaluationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.evaluation_count')}
              key="completionCount"
              minWidth={100}
              render={({ completedSubjectEvaluationCount, totalSubjectEvaluationCount }) => (
                `${completedSubjectEvaluationCount} / ${totalSubjectEvaluationCount}`
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_status')}
              key="moderationStatus"
              minWidth={150}
              render={({ moderationCompletionStatus }) => (
                I18n.t(`admin.assessor_campaigns_statuses_${moderationCompletionStatus}`)
              )}
            />
            <Column
              title={I18n.t('assessors.campaigns_list.column.moderation_count')}
              key="moderationCount"
              minWidth={100}
              render={({ completedSubjectModerationCount, totalSubjectModerationCount }) => (
                `${completedSubjectModerationCount} / ${totalSubjectModerationCount}`
              )}
            />
          </Table>
        )}
      />
    </>
  )
}

export default withEnhancedTable<{}>(connecter(CampaignList), 'assessorsCampaignList', { maintainHistory: true })
