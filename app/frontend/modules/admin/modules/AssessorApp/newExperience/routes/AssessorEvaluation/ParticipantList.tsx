import React, { useEffect } from 'react'
import {
  Table, Tag, Typography, Input, Button,
} from '@thetalententerprise/glint'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { SearchOutlined, RightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import settings from '~/modules/admin/settings'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getParticipants, fetch, FETCH, Participant,
} from '~/modules/admin/modules/AssessorApp/core/participants'
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

const connecter = connect(
  (state: RootState) => ({
    participants: getParticipants(state),
    loading: isRequestInProgress(state, FETCH),
  }),
  { fetch },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = TableProps & PropsFromRedux

const ByParticipant: React.FC<Props> = ({
  participants: { list, total },
  participants: { filterOptions },
  fetch: fetchParticipants,
  loading,
  tableConfig,
  tableConfig: { page, pageSize },
  onTableChange,
  getFilteredValue,
  changePage,
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    fetchParticipants(tableConfig)
  }, [tableConfig])

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
      title: I18n.t('shared.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 100,
    },
    {
      title: I18n.t('admin.campaign'),
      key: 'campaignId',
      filters: filterOptions.campaigns.map(campaign => ({
        text: campaign.name,
        value: campaign.id,
      })),
      filteredValue: getFilteredValue('campaignId'),
      render: (_: unknown, record: Participant) => (
        <div>
          <Typography.Text strong>{record.campaignName}</Typography.Text>
          <br />
          <Typography.Text type="secondary">{record.projectName}</Typography.Text>
        </div>
      ),
    },
    {
      title: I18n.t('admin.assessor_evaluation_candidate'),
      key: 'candidate',
      filterDropdown: candidateFilterDropdown,
      filterIcon: <SearchOutlined />,
      filteredValue: getFilteredValue('candidate'),
      render: (_: unknown, record: Participant) => (
        <div className="flex items-center">
          <CandidateAvatar name={record.candidateName} size="small" />
          <div className="ms-2">
            <Typography.Text strong>{record.candidateName}</Typography.Text>
            <br />
            <Typography.Text type="secondary">{record.candidateEmail}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: I18n.t('admin.assessor_user_evaluation'),
      key: 'evaluationStatus',
      align: 'center' as const,
      filters: statusFilters,
      filteredValue: getFilteredValue('evaluationStatus'),
      render: (_: unknown, record: Participant) => (
        <div className="flex items-center justify-center">
          <Tag color={statusColorMap[record.evaluationStatus as CompletionStatus]}>
            {I18n.t(statusLabelKey[record.evaluationStatus as CompletionStatus])}
          </Tag>
          <Typography.Text strong className="ms-2">
            {`${record.evaluationCompleted}/${record.evaluationTotal}`}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: I18n.t('admin.assessor_user_moderation'),
      key: 'moderationStatus',
      align: 'center' as const,
      filters: statusFilters,
      filteredValue: getFilteredValue('moderationStatus'),
      render: (_: unknown, record: Participant) => (
        <Tag color={statusColorMap[record.moderationStatus as CompletionStatus]}>
          {I18n.t(statusLabelKey[record.moderationStatus as CompletionStatus])}
        </Tag>
      ),
    },
    {
      key: 'arrow',
      width: 48,
      align: 'right' as const,
      render: (_: unknown, record: Participant) => (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/assessors/evaluation/campaigns/${record.campaignId}/users/${record.id}`)
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
            onClick: () => navigate(`/assessors/evaluation/campaigns/${record.campaignId}/users/${record.id}`),
            className: styles.clickableRow,
          })}
        />
        )}
    />
  )
}

export default withEnhancedTable<{}>(connecter(ByParticipant), 'assessorsParticipantList', {
  maintainHistory: true,
  filterPredicates: {
    campaignId: 'In',
    candidate: 'Cont',
    evaluationStatus: 'In',
    moderationStatus: 'In',
  },
})
