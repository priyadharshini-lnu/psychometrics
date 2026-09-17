import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Table, Tag, Typography, StatRow, Input, Button, Flex,
} from '@thetalententerprise/glint'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import dayjs from '~/utils/dayjs'
import settings from '~/modules/admin/settings'
import { RightOutlined, SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getUsers, fetch, FETCH } from '~/modules/admin/modules/AssessorApp/core/users'
import {
  get as getCampaigns, fetch as fetchCampaigns, Campaign,
} from '~/modules/admin/modules/AssessorApp/core/campaigns'
import { isRequestInProgress } from '~/core/request'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableProps } from '~/modules/admin/hoc/withEnhancedTable/interfaces'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import styles from '../../styles.less'
import { CandidateAvatar } from '../../components/CandidateAvatar'
import {
  CompletionStatus, statusColorMap, statusLabelKey,
} from '../../consts'

const { I18n } = window

interface UserRecord {
  id: number
  fullName: string
  email: string
  totalEvaluations: number
  completedEvaluations: number
  evaluationCompletionStatus: string
  totalModeration: number
  completedModeration: number
  moderationCompletionStatus: string
}

const getStatusTag = (status: string) => {
  const color = statusColorMap[status as CompletionStatus]
  const labelKey = statusLabelKey[status as CompletionStatus]

  if (!color || !labelKey) {
    return <Typography.Text>{I18n.t('shared.na_text')}</Typography.Text>
  }

  return <Tag color={color}>{I18n.t(labelKey)}</Tag>
}

const connecter = connect(
  (state: RootState) => ({
    users: getUsers(state),
    campaigns: getCampaigns(state),
    loading: isRequestInProgress(state, FETCH),
  }),
  { fetch, fetchCampaigns },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const CampaignUsers: React.FC<Props> = ({
  users: { list, total },
  campaigns: { list: campaignList },
  fetch: fetchUsers,
  fetchCampaigns: fetchCampaignList,
  loading,
  tableConfig,
  tableConfig: { page, pageSize },
  onTableChange,
  getSortOrder,
  getFilteredValue,
  changePage,
}) => {
  const navigate = useNavigate()
  const { campaignId } = useParams<{ campaignId?: string }>()
  const parsedCampaignId = campaignId ? parseInt(campaignId, 10) : null

  useEffect(() => {
    if (parsedCampaignId) { fetchUsers(parsedCampaignId, tableConfig) }
  }, [tableConfig])

  useEffect(() => {
    if (!campaignList.length) { fetchCampaignList({ filters: {}, sort: {}, page: 1 }) }
  }, [])

  if (!parsedCampaignId) { return null }

  const campaign: Campaign | undefined = campaignList.find(item => item.id === parsedCampaignId)

  const naText = I18n.t('shared.na_text')
  const campaignName = campaign?.name || naText
  const clientName = campaign?.clientName || naText
  const dateRange = campaign?.startDate && campaign?.endDate
    ? `${dayjs(campaign.startDate).format('DD MMM')} – ${dayjs(campaign.endDate).format('DD MMM YYYY')}`
    : naText

  const notStartedCount = list.filter(user => user.evaluationCompletionStatus === 'not_started').length
  const inProgressCount = list.filter(user => user.evaluationCompletionStatus === 'in_progress').length
  const awaitingModerationCount = list.filter(user => (
    user.evaluationCompletionStatus === 'completed' && user.moderationCompletionStatus !== 'completed'
  )).length
  const completedCount = list.filter(user => user.moderationCompletionStatus === 'completed').length

  const statLabel = (title: string, subtitle: string) => (
    <Flex vertical>
      <Typography.Text strong>
        {title}
      </Typography.Text>
      <Typography.Text type="secondary">{subtitle}</Typography.Text>
    </Flex>
  )

  const stats: React.ComponentProps<typeof StatRow>['stats'] = [
    {
      value: total,
      label: statLabel(
        I18n.t('admin.assessor_evaluation_candidates'),
        I18n.t('admin.assessor_campaign_users_candidates_subtitle'),
      ),
    },
    {
      value: notStartedCount,
      label: statLabel(
        I18n.t('admin.assessor_campaign_users_not_started'),
        I18n.t('admin.assessor_campaign_users_not_started_subtitle'),
      ),
    },
    {
      value: inProgressCount,
      label: statLabel(
        I18n.t('admin.assessor_campaign_users_in_progress'),
        I18n.t('admin.assessor_campaign_users_in_progress_subtitle'),
      ),
    },
    {
      value: awaitingModerationCount,
      label: statLabel(
        I18n.t('admin.assessor_campaign_users_awaiting_moderation'),
        I18n.t('admin.assessor_campaign_users_awaiting_moderation_subtitle'),
      ),
    },
    {
      value: completedCount,
      valueColor: 'success',
      label: statLabel(
        I18n.t('admin.assessor_campaign_users_completed'),
        I18n.t('admin.assessor_campaign_users_completed_subtitle'),
      ),
    },
  ]

  const statusFilters = Object.keys(statusLabelKey).map(status => ({
    text: I18n.t(statusLabelKey[status as CompletionStatus]),
    value: status,
  }))

  const candidateFilterDropdown = ({
    close, confirm, clearFilters, selectedKeys, setSelectedKeys,
  }: FilterDropdownProps) => {
    const reset = () => {
      clearFilters?.()
      confirm()
      close()
    }

    return (
      <div className="p-3" style={{ width: 240 }}>
        <Input
          autoFocus
          placeholder={I18n.t('common.actions.search')}
          value={String(selectedKeys[0] ?? '')}
          onChange={event => setSelectedKeys(event.target.value ? [event.target.value] : [])}
          onPressEnter={() => confirm()}
        />
        <div className="flex justify-end mt-2">
          <Button size="small" type="link" disabled={!selectedKeys.length} onClick={reset}>
            {I18n.t('common.actions.reset')}
          </Button>
          <Button size="small" type="primary" onClick={() => confirm()}>
            {I18n.t('common.actions.search')}
          </Button>
        </div>
      </div>
    )
  }

  const columns = [
    {
      title: I18n.t('admin.assessor_evaluation_candidate'),
      key: 'fullName',
      filterDropdown: candidateFilterDropdown,
      filterIcon: <SearchOutlined />,
      filteredValue: getFilteredValue('fullName'),
      sorter: true,
      sortOrder: getSortOrder('fullName'),
      render: (_: unknown, record: UserRecord) => (
        <Flex align="center">
          <CandidateAvatar name={record.fullName} size="small" />
          <div className="ms-2">
            <Typography.Text strong>{record.fullName}</Typography.Text>
            <br />
            <Typography.Text type="secondary">{record.email}</Typography.Text>
          </div>
        </Flex>
      ),
    },
    {
      title: I18n.t('admin.assessor_user_evaluation'),
      key: 'evaluationStatus',
      filters: statusFilters,
      filteredValue: getFilteredValue('evaluationStatus'),
      render: (_: unknown, record: UserRecord) => (
        <Flex align="center">
          {getStatusTag(record.evaluationCompletionStatus)}
          <Typography.Text strong className="ms-2">
            {`${record.completedEvaluations}/${record.totalEvaluations}`}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: I18n.t('admin.assessor_user_moderation'),
      key: 'moderationStatus',
      filters: statusFilters,
      filteredValue: getFilteredValue('moderationStatus'),
      render: (_: unknown, record: UserRecord) => getStatusTag(record.moderationCompletionStatus),
    },
    {
      key: 'arrow',
      width: 48,
      align: 'right' as const,
      render: (_: unknown, record: UserRecord) => (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/assessors/evaluation/campaigns/${parsedCampaignId}/users/${record.id}`)
          }}
        />
      ),
    },
  ]

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: { campaignId: parsedCampaignId },
        }}
        crumbs={[{
          link: () => '/assessors/evaluation',
          label: () => I18n.t('common.model.campaigns'),
        }, {
          label: state => state.campaign.name,
        },
        ]}
      />
      <div className="p-6">
        <Typography.Title level={2} className="mb-1">{campaignName}</Typography.Title>
        <Typography.Text type="secondary">
          {`${clientName} · ${dateRange}`}
        </Typography.Text>
      </div>

      <StatRow showDivider={false} className="ps-6 pe-6 mb-6" stats={stats} />

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
              onClick: () => navigate(
                `/assessors/evaluation/campaigns/${parsedCampaignId}/users/${record.id}`,
              ),
              className: styles.clickableRow,
            })}
          />
        )}
      />
    </>
  )
}

export default withEnhancedTable<{}>(
  connecter(CampaignUsers),
  'assessorsCampaignUsers',
  {
    maintainHistory: true,
    filterPredicates: {
      fullName: 'Cont',
      evaluationStatus: 'In',
      moderationStatus: 'In',
    },
  },
)
