import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  Row, Col, Button, PageHeader, Descriptions, Switch, Tag, Modal, message, Space,
} from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import Modals from '~/modules/admin/components/Modals/'
import array from '~/utils/array'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import AddReportModal from '../../../AssessmentsReports/routes/Manage/AddReportModal'
import UpdateNormModal from './UpdateNormModal'
import UpdateTimeModal from './UpdateTimeModal'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import UpdateCampaignTimeModal from './UpdateCampaignTimeModal'
import { Strategies } from '../../../AssessmentsReports/routes/Manage/AddReportModal/interfaces'
import { ProctoringSessionList } from './ProctoringSessionList'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import WorkshopList from './WorkshopList'
import WorkshopInviteList from './WorkshopInviteList/WorkshopList'
import { SchedulingAssessmentModal } from './AssessmentList/SchedulingAssessmentModal'

const { I18n } = window

const MODALS = {
  AddReportModal,
  UpdateNormModal,
  UpdateTimeModal,
  PushWebhookModal,
  UpdateCampaignTimeModal,
  SchedulingAssessmentModal,
}

interface OwnProps {
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void,
}

interface Params {
  projectId: string
  campaignId: string
  id: string
}

export type Props = OwnProps & PropsFromRedux & RouteComponentProps<Params>

const AssessmentsReports: React.FC<Props> = ({
  user,
  assessmentStatuses,
  fetchSingleUser,
  match: { params: { projectId, campaignId, id } },
  openModal,
  toggleActive,
  remove,
  selectedIds,
  regenerateReports,
  regenerateInProgress,
  history,
  extendTime,
  proctoringSessions,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(id, 10)

  useEffect(() => {
    fetchSingleUser(parsedCampaignId, parsedUserId)
  }, [])

  if (!user) { return null }

  const statusToColor = {
    new: 'blue',
    not_started: 'blue',
    in_progress: 'orange',
    completed: 'green',
    interrupted: 'orange',
    timed_out: 'red',
  }

  const userCampaigns = () => {
    const campaigns = _.map(user.campaigns, (campaign) => {
      if (campaign.id === parsedCampaignId) { return campaign.name }
      return (
        <a key={campaign.id} href={`/admin/projects/${projectId}/new_campaigns/${campaignId}`}>
          {campaign.name}
        </a>
      )
    })
    return array.joinJSXElements(campaigns, ', ')
  }

  const campaign = _.find(user.campaigns, { id: parsedCampaignId })
  const campaignName = _.find(user.campaigns, { id: parsedCampaignId })?.name
  const isFixedTime = campaign?.campaignOptions?.fixedTime || false

  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.details.modals.remove.title', { campaignName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove(campaignId, parsedUserId)
        history.push(`/admin/projects/${projectId}/new_campaigns/${campaignId}/users`)
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email: user.email }))
      },
    })
  }

  const handleRegenerateReports = () => {
    regenerateReports(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  const canExtendTime = (isFixedTime && ['timed_out', 'completed'].includes(user.status))

  return (
    <div>
      <Row justify="space-between" className="pm">
        <PageHeader
          ghost={false}
          title={user.fullName}
          subTitle={user.email}
          extra={user.permissions.remove && [
            <Button key="3" onClick={() => handleDelete()}>
              {I18n.t('common.actions.remove') }
            </Button>,
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label={I18n.t('administration.campaigns.users.is_active')}>
              <Switch
                checked={user.active}
                disabled={!user.permissions.toggleStatus}
                onChange={
                  () => {
                    toggleActive(campaignId, parsedUserId, { updateInListing: false })
                  }
              }
              />
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('common.model.campaigns')}>
              {userCampaigns()}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('campaign_users.assessments.progress')}>
              {_.map(assessmentStatuses, (value, status) => (
                <Tag key={status} color={statusToColor[status]}>{`${value} ${_.capitalize(status)}`}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('campaign_users.details.completion_status')}>
              <Tag key={status} color={statusToColor[user.completionStatus]}>
                {I18n.t(`frontend.campaign.users.completion_statuses.${user.completionStatus}`)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('common.column.status')}>
              {user.additionalTime && user.status === 'interrupted'
                && (
                <span className="prs">
                  {`+ ${Math.round(user.additionalTime / 60)} ${I18n.t('common.text.minutes')}`}
                </span>
                )}
              <Tag key={status} color={statusToColor[user.status]}>
                {I18n.t(`campaign_users.details.statuses.${user.status}`)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('campaign_users.details.last_login')}>
              {user.lastSignInAt || I18n.t('campaign_users.details.not_logged_in_yet')}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('common.column.created_at')}>
              {user.createdAt}
            </Descriptions.Item>
            {canExtendTime && (
              <>
                <Descriptions.Item label={I18n.t('campaign_users.details.additional_time')}>
                  <span className="prs">{user.additionalTime}</span>

                  <Button
                    danger
                    size="small"
                    onClick={() => openModal('UpdateCampaignTimeModal', {
                      campaignId: parsedCampaignId,
                      userId: parsedUserId,
                      updateAdditionalTime: extendTime,
                    })}
                  >
                    <PlusOutlined />
                    <span>{I18n.t('campaign_users.actions.extend_time')}</span>
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label={I18n.t('campaign_users.details.started_at')}>
                  {user.startedAt || I18n.t('campaign_users.details.not_started_yet')}
                </Descriptions.Item>
                <Descriptions.Item label={I18n.t('campaign_users.details.completed_at')}>
                  {user.completedAt || I18n.t('campaign_users.details.not_completed_yet')}
                </Descriptions.Item>
              </>
            )}
            {user.hoganId && (
              <Descriptions.Item label={I18n.t('campaign_users.details.hogan_id')}>
                {user.hoganId}
              </Descriptions.Item>
            )}
          </Descriptions>
        </PageHeader>
        <Col span={4} className="pls">
          <h3>{I18n.t('common.model.reports')}</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {user.permissions.regenerateReport && (
                <Button
                  type="default"
                  onClick={handleRegenerateReports}
                  disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                  loading={regenerateInProgress}
                >
                  <span>{I18n.t('user_reports.actions.regenerate')}</span>
                </Button>
              )}
              {user.permissions.addReport && (
                <Button
                  type="primary"
                  onClick={() => openModal('AddReportModal', {
                    campaignId: parsedCampaignId,
                    userId: parsedUserId,
                    strategy: Strategies.SINGLE,
                  })}
                >
                  <PlusOutlined />
                  <span>{I18n.t('reports.actions.add')}</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <div className="pm">
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('common.model.assessments')}</h3>
        <AssessmentList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('campaign_users.details.assessment_center')}</h3>
        <WorkshopList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('campaign_users.details.assessment_center_invites')}</h3>
        <WorkshopInviteList />
        {proctoringSessions.length !== 0 && (
          <>
            <div className={styles.tableDivider} />
            <h3>{I18n.t('administration.proctoring_sessions.resource_name')}</h3>
            <ProctoringSessionList proctoringSessions={proctoringSessions} />
          </>
        )}
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default AssessmentsReports
