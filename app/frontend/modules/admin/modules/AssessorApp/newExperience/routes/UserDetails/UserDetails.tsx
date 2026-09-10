import React, {
  useEffect, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Tag, Typography, Button, Progress, Tabs, Flex, Descriptions, Spin,
} from '@thetalententerprise/glint'
import { useNavigate, useParams } from 'react-router-dom'
import { FormOutlined, AuditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getCurrent, fetchSingle } from '~/modules/admin/modules/AssessorApp/core/users'
import { get as getUserAssessments } from '~/modules/admin/modules/AssessorApp/core/userAssessments'
import { get as getUserReports } from '~/modules/admin/modules/AssessorApp/core/userReports'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import RecordingsList from './RecordingsList'
import AssessmentsList from './AssessmentsList'
import ReportsList from './ReportsList'
import { CandidateAvatar } from '../../components/CandidateAvatar'
import {
  CompletionStatus, statusColorMap, statusLabelKey,
} from '../../consts'

const { I18n } = window

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
    user: getCurrent(state),
    userAssessments: getUserAssessments(state),
    userReports: getUserReports(state).list,
  }),
  { fetchSingle },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const UserDetails: React.FC<Props> = ({
  user,
  userAssessments,
  userReports,
  fetchSingle: fetchSingleUser,
}) => {
  const navigate = useNavigate()
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const parsedCampaignId = campaignId ? parseInt(campaignId, 10) : null
  const parsedUserId = userId ? parseInt(userId, 10) : null
  const [datasheetRowsData, setDatasheetRowsData] = useState<Record<string, string>>({})
  const [isUserLoading, setIsUserLoading] = useState(true)

  const {
    collectionAction: fetchDatasheetRows, isLoading: isDatasheetLoading,
  } = useResources('datasheet_rows', {
    apiConfig: {
      filter: {
        user_id: userId ?? '',
        campaign_id: campaignId ?? '',
      },
    },
  })

  useEffect(() => {
    if (!parsedCampaignId || !parsedUserId) {
      setIsUserLoading(false)
      return
    }

    Promise.resolve(fetchSingleUser(parsedCampaignId, parsedUserId)).finally(() => setIsUserLoading(false))
  }, [fetchSingleUser, parsedCampaignId, parsedUserId])

  useEffect(() => {
    if (!campaignId || !userId) {
      return
    }

    fetchDatasheetRows({
      action: 'datasheet_for_assessor',
      method: 'get',
    }).then((response) => {
      const rows = (response as Record<string, string>) || {}
      setDatasheetRowsData(rows)
    })
  }, [campaignId, userId])

  const datasheetItems = Object.entries(datasheetRowsData)
  const loading = isUserLoading || isDatasheetLoading('fetch')

  if (!parsedCampaignId || !parsedUserId || !user) { return null }

  const naText = I18n.t('shared.na_text')

  const completedEvaluations = user?.completedEvaluations ?? 0
  const totalEvaluations = user?.totalEvaluations ?? 0
  const progressPercent = totalEvaluations
    ? Math.round((completedEvaluations / totalEvaluations) * 100)
    : 0

  const goToEvaluate = () => navigate(
    `/assessors/evaluation/campaigns/${parsedCampaignId}/evaluations/${user.id}`,
  )

  const goToModerate = () => navigate(
    `/assessors/evaluation/campaigns/${parsedCampaignId}/moderate_scoring/${user.id}`,
  )

  const tabs = [
    {
      key: 'assessments',
      label: I18n.t('assessments_reports.menu.assessments_and_reports'),
      children: (
        <>
          <AssessmentsList assessments={userAssessments} />
          <ReportsList reports={userReports} campaignId={parsedCampaignId} />
        </>
      ),
    },
    {
      key: 'recordings',
      label: I18n.t('assessments_reports.menu.recordings'),
      children: <RecordingsList />,
    },
  ]

  return (
    <Spin spinning={loading}>
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
            link: () => `/assessors/evaluation/campaigns/${parsedCampaignId}/users`,
          },
          {
            label: () => user.fullName,
          },
          ]}
        />
        <Flex vertical gap={24}>
          <Flex align="center" justify="space-between" className="p-6">
            <Flex align="center">
              <CandidateAvatar name={user.fullName} size={64} />
              <div className="ms-3">
                <Typography.Title level={2} className="mb-0">{user.fullName}</Typography.Title>
                <Typography.Text type="secondary">{user.email}</Typography.Text>
              </div>
            </Flex>
            <Flex align="center">
              <Button variant="outlined" icon={<FormOutlined />} onClick={goToEvaluate}>
                {I18n.t('admin.assessor_user_evaluate')}
              </Button>
              {user.assessorCanModerateScores && (
                <Button
                  variant="solid"
                  scheme="secondary"
                  className="ms-2"
                  icon={<AuditOutlined />}
                  onClick={goToModerate}
                >
                  {I18n.t('admin.assessor_user_moderate')}
                </Button>
              )}
            </Flex>
          </Flex>

          {!!datasheetItems.length && (
            <div className="ps-6 pe-6">
              <Descriptions
                bordered
                column={4}
                layout="vertical"
                size="large"
                styles={{
                  content: { background: 'var(--white-bg)' },
                }}
                items={datasheetItems.map(([label, value]) => ({
                  key: label,
                  label: <Typography.Text strong className="transform-capitalize">{label}</Typography.Text>,
                  children: value || naText,
                }))}
              />
            </div>
          )}

          <div className="ps-6 pe-6">
            <Flex align="center" gap={16} className="mb-2">
              <div style={{ flex: 1 }}>
                <Typography.Text strong>
                  {I18n.t('admin.assessor_user_evaluation_progress')}
                </Typography.Text>
              </div>
              <div style={{ width: 120, textAlign: 'center' }}>
                <Typography.Text strong>
                  {I18n.t('admin.assessor_user_evaluation')}
                </Typography.Text>
              </div>
              <div style={{ width: 120, textAlign: 'center' }}>
                <Typography.Text strong>
                  {I18n.t('admin.assessor_user_moderation')}
                </Typography.Text>
              </div>
            </Flex>
            <Flex align="center" gap={16}>
              <Flex align="center" gap={12} style={{ flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <Progress percent={progressPercent} showInfo={false} />
                </div>
                <Flex align="baseline" gap={2}>
                  <Typography.Text style={{ fontSize: 'var(--ant-font-size-xl)' }} strong>
                    {completedEvaluations}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {`/${totalEvaluations}`}
                  </Typography.Text>
                </Flex>
              </Flex>
              <div style={{ width: 120, textAlign: 'center' }}>
                {getStatusTag(user.evaluationCompletionStatus)}
              </div>
              <div style={{ width: 120, textAlign: 'center' }}>
                {getStatusTag(user.moderationCompletionStatus)}
              </div>
            </Flex>
          </div>

          <Tabs
            className="pb-6"
            classNames={{
              header: 'ps-6 pe-6',
            }}
            defaultActiveKey="assessments"
            items={tabs}
          />
        </Flex>

      </>
    </Spin>
  )
}

export default connecter(UserDetails)
