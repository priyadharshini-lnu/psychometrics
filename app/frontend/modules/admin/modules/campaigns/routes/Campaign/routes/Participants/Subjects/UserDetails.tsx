import React, { useEffect, useState } from 'react'
import {
  Row, Button, Descriptions, Switch, Tag, App, Tabs, Skeleton,
} from 'antd'
import { PageHeader } from '@ant-design/pro-layout'
import { PlusOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { camelizeKeys } from '~/utils/object'
import { isRequestInProgress } from '~/core/request'
import AssessmentsReports from './AssessmentsReports'
import AssessmentCenter from './AssessmentCenter'
import { Idp } from './Idp'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getStatusesCount } from '~/modules/admin/modules/campaigns/core/userAssessments'
import {
  fetchSingle as fetchSingleUser,
  FETCH_SINGLE,
  getCurrent as getCurrentUser,
  remove,
  toggleActive,
  extendTime,
} from '~/modules/admin/modules/campaigns/core/users'
import styles from './UserDetails.less'
import array from '~/utils/array'
import UpdateTimeModal from './UpdateTimeModal'
import AddReportModal from '../../AssessmentsReports/routes/AssessmentsReports/AddReportModal'
import UpdateNormModal from './AssessmentsReports/UpdateNormModal'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import UpdateCampaignTimeModal from './AssessmentsReports/UpdateCampaignTimeModal'
import { SchedulingAssessmentModal } from './AssessmentsReports/AssessmentList/SchedulingAssessmentModal'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { AssignManagerFormModal } from './AssignManagerFormModal'
import UploadFileModal from './AssessmentsReports/UploadFileModal'
import { getFeatures } from '~/core/config'
import CreateHoganCredentialsModal from './CreateHoganCredentialsModal'

const { I18n } = window

const MODALS = {
  AddReportModal,
  UpdateNormModal,
  PushWebhookModal,
  UpdateCampaignTimeModal,
  SchedulingAssessmentModal,
  UpdateTimeModal,
  AssignManagerFormModal,
  UploadFileModal,
  CreateHoganCredentialsModal,
}

export const connecter = connect(
  (state: RootState) => ({
    user: getCurrentUser(state),
    assessmentStatuses: getStatusesCount(state),
    loading: isRequestInProgress(state, FETCH_SINGLE),
    features: getFeatures(state),
  }),
  {
    fetchSingleUser,
    toggleActive,
    remove,
    extendTime,
    openModal,
  },
)

type Props = ConnectedProps<typeof connecter>

export const UserDetails: React.FC<Props> = ({
  loading,
  user,
  fetchSingleUser,
  assessmentStatuses,
  openModal,
  toggleActive,
  remove,
  extendTime,
  features,
}) => {
  const {
    projectId, campaignId, tab: paramTab, id: userId,
  } = useParams() as {
    projectId: string, campaignId: string, tab: string, id: string
  }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(userId, 10)

  const { modal, message } = App.useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState(paramTab || 'assessments')
  const { idpEnabled } = camelizeKeys(features)

  useEffect(() => {
    fetchSingleUser(parsedCampaignId, parsedUserId)
  }, [])

  if (loading) {
    return <Skeleton active />
  }

  if (!user) { return null }

  const statusToColor = {
    new: 'blue',
    not_started: 'blue',
    in_progress: 'orange',
    completed: 'green',
    interrupted: 'orange',
    timed_out: 'red',
  }

  const changeTab = (tab) => {
    navigate(`${tab}`)
    setTab(tab)
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

  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.details.modals.remove.title', { campaignName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove(campaignId, parsedUserId)
        navigate(`/admin/projects/${projectId}/new_campaigns/${campaignId}/participants/subjects`)
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email: user.email }))
      },
    })
  }

  const handleCreateHoganCredentials = () => {
    fetchSingleUser(parsedCampaignId, parsedUserId)
  }

  const isFixedTime = campaign?.campaignOptions?.fixedTime || false
  const canExtendTime = (isFixedTime && ['timed_out', 'completed'].includes(user.status))
  const tabs = [
    {
      key: 'assessments',
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
      children: <AssessmentsReports />,
    },
  ]
  if (user.permissions.viewWorkshopDetails) {
    tabs.push({
      key: 'assessment_center',
      label: I18n.t('assessments_reports.menu.assessment_center'),
      children: <AssessmentCenter />,
    })
  }
  if (idpEnabled) {
    tabs.push({
      key: 'idp',
      label: I18n.t('assessments_reports.menu.idp'),
      children: <Idp />,
    })
  }

  return (
    <div>
      <Row justify="space-between">
        <PageHeader
          ghost={false}
          title={user.fullName}
          subTitle={user.email}
          extra={user.permissions.remove && [
            <Button key="3" onClick={() => handleDelete()}>
              {I18n.t('common.actions.remove')}
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
            {assessmentStatuses && (
              <Descriptions.Item label={I18n.t('campaign_users.assessments.progress')}>
                {_.map(assessmentStatuses, (value, status) => (
                  <Tag key={status} color={statusToColor[status]}>{`${value} ${_.capitalize(status)}`}</Tag>
                ))}
              </Descriptions.Item>
            )}
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
            <Descriptions.Item label={I18n.t('campaign_users.details.manager')}>
              {user.manager.name && (
                <>
                  {user.manager.name}
                  {' '}
                  (
                  {user.manager.email}
                  )
                </>
              )}
              <Button size="small">
                <EditOutlined
                  onClick={() => openModal('AssignManagerFormModal', {
                    projectId,
                    userId,
                    manager: user.manager,
                  })
                  }
                />
              </Button>
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
                <>
                  {user.hoganId}
                  {' '}
                  (
                  {user.hoganProvider}
                  )
                </>
                <Button size="small">
                  <PlusOutlined
                    onClick={() => openModal('CreateHoganCredentialsModal', {
                      email: user.email,
                      campaignId,
                      parsedUserId,
                      handleCreateHoganCredentials,
                      userAssessments: user.userAssessments,
                      userReports: user.userReports,
                    })}
                  />
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        </PageHeader>
      </Row>
      <Tabs
        activeKey={tab}
        onChange={changeTab}
        defaultActiveKey="assessments"
        className={styles.tabs}
        items={tabs}
      />
      <Modals modals={MODALS} />
    </div>
  )
}

export default connecter(UserDetails)
