import React, { useEffect, useState } from 'react'
import {
  Button, Descriptions, Divider, Switch, Tag, App, Menu, Skeleton, Space, Drawer, Empty,
} from 'antd'
import { PageHeader } from '@ant-design/pro-components'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import {
  Assignment, Event, Explore, Mail, Videocam,
} from '@thetalententerprise/glint/icons'
import {
  ArrowRightOutlined, PlusOutlined, ExclamationCircleOutlined, EditOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { camelizeKeys } from '~/utils/object'
import { isRequestInProgress } from '~/core/request'
import AssessmentsReports from './AssessmentsReports'
import AssessmentCenter from './AssessmentCenter'
import AssessmentCenterInvites from './AssessmentCenterInvites'
import Idp from './Idp'
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
import { EditLevelFormModal } from './EditLevelFormModal'
import { EditJobRoleFormModal } from './EditJobRoleFormModal'
import ReportsLanguageSelectionModal from '~/modules/admin/components/ReportsLanguageSelectionModal'
import DownloadIndividualReportModal from '~/components/DownloadIndividualReportModal'
import { Recordings } from './Recordings'
import RescoreResponseModal from '~/modules/admin/modules/campaigns/components/RescoreResponseModal'

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
  ReportsLanguageSelectionModal,
  DownloadIndividualReportModal,
  EditLevelFormModal,
  EditJobRoleFormModal,
  RescoreResponseModal,
}

export const connecter = connect(
  (state: RootState) => ({
    user: getCurrentUser(state),
    assessmentStatuses: getStatusesCount(state),
    loading: isRequestInProgress(state, FETCH_SINGLE),
    features: getFeatures(state),
    projectIdpEnabled: state.config.project.idpEnabled,
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
  projectIdpEnabled,
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
  const [campaignsDrawerOpen, setCampaignsDrawerOpen] = useState(false)
  const [drawerCampaigns, setDrawerCampaigns] = useState<{ id: number, name: string }[]>([])
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
    progress: 'orange',
    completed: 'green',
    interrupted: 'orange',
    timed_out: 'red',
  }

  const changeTab = (tab) => {
    //  {userId}/assessments removes the last segment and append the new tab
    navigate(`../${tab}`, { relative: 'path' })
    setTab(tab)
  }

  const userCampaigns = () => {
    const allCampaigns = user.campaigns
    const hasMore = allCampaigns.length > 3
    const visibleCount = hasMore ? 2 : 3
    const visibleCampaigns = allCampaigns.slice(0, visibleCount)
    const hiddenCount = allCampaigns.length - visibleCount

    const campaignLinks = _.map(visibleCampaigns, (campaign, index) => {
      const isLastCampaign = index === visibleCampaigns.length - 1

      return (
        <Link key={campaign.id} to={`/admin/projects/${projectId}/new_campaigns/${campaign.id}`}>
          {campaign.name}
          {!isLastCampaign && ', '}
        </Link>
      )
    })

    return (
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center',
      }}
      >
        <div>{campaignLinks}</div>
        {hasMore && (
          <Button
            size="small"
            onClick={() => {
              setDrawerCampaigns(allCampaigns)
              setCampaignsDrawerOpen(true)
            }}
          >
            {`+${hiddenCount}`}
          </Button>
        )}
      </div>
    )
  }

  const campaign = _.find(user.campaigns, { id: parsedCampaignId })
  const campaignName = _.find(user.campaigns, { id: parsedCampaignId })?.name

  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('shared.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.details.modals.remove.title', { campaignName }),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
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

  const handleEditJobRole = () => {
    openModal('EditJobRoleFormModal', {
      projectId,
      campaignId: parsedCampaignId,
      userId: parsedUserId,
      currentJobRole: user.currentJobRole,
      targetJobRole: user.targetJobRole,
    })
  }

  const isFixedTime = campaign?.campaignOptions?.fixedTime || false
  const canExtendTime = (isFixedTime && ['timed_out', 'completed'].includes(user.status))
  const tabs = [
    {
      key: 'assessments',
      icon: <Assignment />,
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
      panel: <AssessmentsReports />,
    },
  ]
  if (user.permissions.viewWorkshopDetails) {
    tabs.push({
      key: 'assessment_center',
      icon: <Event />,
      label: I18n.t('assessments_reports.menu.assessment_center'),
      panel: <AssessmentCenter />,
    })
  }
  if (user.permissions.viewWorkshopDetails) {
    tabs.push({
      key: 'assessment_center_invites',
      icon: <Mail />,
      label: I18n.t('assessments_reports.menu.assessment_center_invites'),
      panel: <AssessmentCenterInvites />,
    })
  }
  if (user.permissions.viewIdpPlan && idpEnabled && projectIdpEnabled) {
    tabs.push({
      key: 'idp',
      icon: <Explore />,
      label: I18n.t('assessments_reports.menu.idp'),
      panel: <Idp />,
    })
  }
  if (user.permissions.viewRecordings) {
    tabs.push({
      key: 'recordings',
      icon: <Videocam />,
      label: I18n.t('assessments_reports.menu.recordings'),
      panel: <Recordings />,
    })
  }

  const activeTab = tabs.find(({ key }) => key === tab) ?? tabs[0]

  return (
    <div>
      <PageHeader
        ghost={false}
        title={user.fullName}
        subTitle={user.email}
        extra={user.permissions.remove && [
          <Button key="3" onClick={() => handleDelete()}>
            {I18n.t('shared.remove')}
          </Button>,
        ]}
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label={I18n.t('admin.campaigns_users_is_active')}>
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
          <Descriptions.Item label={I18n.t('admin.campaigns')}>
            {userCampaigns()}
          </Descriptions.Item>
          {assessmentStatuses && (
            <Descriptions.Item label={I18n.t('campaign_users.assessments.progress')}>
              {_.map(assessmentStatuses, (value, status) => (
                <Tag key={status} color={statusToColor[status]}>
                  {`${value}
                  ${I18n.t(`campaign_assessment.statuses.${status}`)}`}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={I18n.t('campaign_users.details.completion_status')}>
            <Tag key={status} color={statusToColor[user.completionStatus]}>
              {I18n.t(`frontend.campaign.users.completion_statuses.${user.completionStatus}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.status')}>
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
          <Descriptions.Item label={I18n.t('shared.created_at')}>
            {user.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('campaign_users.details.manager')}>
            <Space align="center">
              <span>
                {user.manager?.name && (
                  <>
                    {user.manager.name}
                    {' '}
                    (
                    {user.manager.email}
                    )
                  </>
                )}
              </span>
              <Button size="small">
                <EditOutlined
                  onClick={() => openModal('AssignManagerFormModal', {
                    projectId,
                    campaignId: parsedCampaignId,
                    userId,
                    manager: user.manager,
                  })
                  }
                />
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.level')}>
            <Space align="center">
              <span>{user.level && I18n.t(`admin.level_${user.level}`)}</span>
              <Button size="small">
                <EditOutlined
                  onClick={() => openModal('EditLevelFormModal', {
                    campaignId: parsedCampaignId,
                    userId: parsedUserId,
                    level: user.level,
                  })
                  }
                />
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.current_job_role')}>
            <Space align="center">
              <span>{user.currentJobRole?.name}</span>
              <Button size="small">
                <EditOutlined onClick={handleEditJobRole} />
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.target_job_role')}>
            <Space align="center">
              <span>{user.targetJobRole?.name}</span>
              <Button size="small">
                <EditOutlined onClick={handleEditJobRole} />
              </Button>
            </Space>
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
      <Divider style={{ margin: 0 }} />
      {tabs.length > 1 && (
        <Menu
          items={tabs.map(({ key, icon, label }) => ({ key, icon, label }))}
          onSelect={({ key }) => changeTab(key)}
          selectedKeys={[activeTab.key]}
          mode="horizontal"
        />
      )}
      {activeTab.panel}
      <Modals modals={MODALS} />
      <Drawer
        title={I18n.t('common.model.campaigns')}
        placement="right"
        closable
        onClose={() => setCampaignsDrawerOpen(false)}
        open={campaignsDrawerOpen}
        width="50%"
        footer={(
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setCampaignsDrawerOpen(false)}>
              {I18n.t('common.actions.cancel')}
            </Button>
          </Space>
        )}
      >
        {drawerCampaigns && drawerCampaigns.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {drawerCampaigns.map(campaign => (
              <Link
                key={campaign.id}
                to={`/admin/projects/${projectId}/new_campaigns/${campaign.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 8px',
                  textDecoration: 'none',
                  color: '#0066cc',
                  borderBottom: '1px solid #d9d9d9',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{campaign.name}</span>
                <ArrowRightOutlined style={{ marginLeft: '16px', flexShrink: 0, color: '#999' }} />
              </Link>
            ))}
          </div>
        ) : (
          <Empty description={I18n.t('shared.no_results_found')} />
        )}
      </Drawer>
    </div>
  )
}

export default connecter(UserDetails)
