import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Table, Typography, Button } from '@thetalententerprise/glint'
import { useNavigate } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import { RightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import settings from '~/modules/admin/settings'
import {
  get as getCampaigns, fetch, FETCH, Campaign,
} from '~/modules/admin/modules/AssessorApp/core/campaigns'
import { isRequestInProgress } from '~/core/request'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import styles from '../../styles.less'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    campaigns: getCampaigns(state),
    loading: isRequestInProgress(state, FETCH),
  }),
  { fetch },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const CampaignList: React.FC<Props> = ({
  campaigns: { list, total },
  fetch: fetchCampaigns,
  loading,
  tableConfig,
  tableConfig: { page, pageSize },
  onTableChange,
  changePage,
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    fetchCampaigns(tableConfig)
  }, [tableConfig])

  const columns = [
    {
      title: I18n.t('admin.campaign'),
      key: 'campaign',
      render: (_: unknown, record: Campaign) => (
        <div>
          <Typography.Text strong>
            {record.name}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: I18n.t('admin.project'),
      key: 'client',
      render: (_: unknown, record: Campaign) => record.projectName,
    },
    {
      title: I18n.t('admin.assessor_evaluation_date_range'),
      key: 'dateRange',
      render: (_: unknown, record: Campaign) => {
        if (!record.startDate && !record.endDate) return I18n.t('shared.na_text')
        const start = record.startDate
          ? dayjs(record.startDate).format('L')
          : I18n.t('shared.na_text')
        const end = record.endDate
          ? dayjs(record.endDate).format('L')
          : I18n.t('shared.na_text')
        return `${start} – ${end}`
      },
    },
    {
      title: I18n.t('admin.assessor_evaluation_candidates'),
      key: 'candidates',
      align: 'center' as const,
      render: (_: unknown, record: Campaign) => (
        <Typography.Text strong>
          {record.totalSubjectsCount}
        </Typography.Text>
      ),
    },
    {
      title: I18n.t('admin.assessor_evaluation_completed'),
      key: 'evaluationCompleted',
      align: 'center' as const,
      render: (_: unknown, record: Campaign) => (
        <span>
          <Typography.Text strong>
            {record.completedSubjectEvaluationCount}
          </Typography.Text>
          <Typography.Text>
            {`/${record.totalSubjectEvaluationCount}`}
          </Typography.Text>
        </span>
      ),
    },
    {
      title: I18n.t('admin.assessor_evaluation_moderation_waiting'),
      key: 'moderationWaiting',
      align: 'center' as const,
      render: (_: unknown, record: Campaign) => {
        const waiting = record.totalSubjectModerationCount
          - record.completedSubjectModerationCount
        return (
          <Typography.Text
            strong
            type="warning"
          >
            {waiting}
          </Typography.Text>
        )
      },
    },
    {
      key: 'arrow',
      width: 48,
      align: 'right' as const,
      render: (_: unknown, record: Campaign) => (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/assessors/evaluation/campaigns/${record.id}/users`)
          }}
        />
      ),
    },
  ]

  return (
    <TableLayout
      title=""
      disableHeader
      recordCount={total}
      loading={loading}
      pagination={{
        page,
        pageSize: pageSize ?? settings.pagination.defaultPageSize,
        total,
        onChange: changePage,
      }}
      table={(
        <Table
          dataSource={list}
          columns={columns}
          rowKey="id"
          onChange={onTableChange}
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={record => ({
            onClick: () => navigate(`/assessors/evaluation/campaigns/${record.id}/users`),
            className: styles.clickableRow,
          })}
        />
        )}
    />
  )
}

export default withEnhancedTable<{}>(
  connecter(CampaignList),
  'assessorsCampaignList',
  { maintainHistory: true },
)
