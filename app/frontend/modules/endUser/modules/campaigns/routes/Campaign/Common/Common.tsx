import {
  FC, useContext, useState,
} from 'react'
import {
  connect, ConnectedProps, useSelector,
} from 'react-redux'
import _ from 'lodash'
import {
  Row, Col, Alert, Button, Result, Typography, Space, App,
  Skeleton,
} from 'antd'
import cs from 'classnames'
import {
  InfoCircleOutlined,
  PlayCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'

import { STATUSES } from '~/constants/campaign'
import { Flash } from '~/components/Flash'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  reset as resetCampaign,
  resetPracticeCampaign,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { acceptPolicy } from '~/modules/endUser/modules/campaigns/core/project'

import { SafeHTML } from '~/components/SafeHTML'
import { useIsProctored } from '~/hooks/useProctoringState'
import { ProgressStatus, MediaQueryContext } from '~/glint'
import { CampaignPageHeader } from './CampaignPageHeader'
import { AssessmentsContainer } from './AssessmentsContainer'
import { InstructionsPanel } from './InstructionsPanel'
import { AssessmentCardContainer } from './AssessmentCardContainer'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'
import styles from './styles.less'
import { MaintenanceStatus, MaintenanceAlert } from '~/glint/components/MaintenanceAlert'

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    instructions: state.campaigns.campaign.instructions,
    currentUser: state.currentUser,
    privacyConsentRequired: state.campaigns.campaign?.privacyConsentRequired,
    maintenanceSettings: state.maintenanceSettings,
  }),
  {
    resetCampaign,
    acceptPolicy,
    resetPracticeCampaign,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type CommonComponentProps = PropsFromRedux

const { Title } = Typography
const { I18n } = window


const CommonComponent: FC<CommonComponentProps> = ({
  campaign,
  campaign: {
    campaignUser, groups,
    campaignUser: { expiryDate },
  },
  resetPracticeCampaign,
  maintenanceSettings,
}) => {
  const { modal, message } = App.useApp()
  const { isMobile } = useContext(MediaQueryContext)
  const {
    isTimedCampaign,
    fixedTimed,
    campaignsCount,
    campaignOptions: {
      instructionsEnabled, instructions, proctoringEnabled, proctoringEnabledOnWorkshopActivity,
      selectiveProctoringEnabled,
    },
  } = campaign
  const campaignLevelProctoringEnabled = proctoringEnabled && !selectiveProctoringEnabled

  const hasFlashMessages = useSelector((state: RootState) => state.flash?.length > 0)
  const { isProctored, proctoringCheckInProgress } = useIsProctored()
  const campaignNeedsProctoring = campaignLevelProctoringEnabled && !isProctored
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  // TODO: We can check completion_status here. Also need to take care for assessment timed_out status when we add it
  const allAssessmentsComplete = counters.completed === campaign.userAssessments.length
  const hasAssessments = !!campaign.userAssessments.length

  let allAssessmentCompleteBasedOnWorkshopProctoringSetting = allAssessmentsComplete
  if (!proctoringEnabledOnWorkshopActivity && !allAssessmentsComplete && hasAssessments) {
    allAssessmentCompleteBasedOnWorkshopProctoringSetting = campaign.userAssessments.every(
      ua => (ua.workshopActivity ? true : ua.status === 'completed'),
    )
  }
  const allPreworkIsComplete = _.find(
    campaign.userAssessments, ua => ua.prework && ua.status !== 'completed',
  ) === undefined
  let ungrouped = _.compact(
    campaign.ungroupedAssessmentsIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
  )
  const hasStartedCampaign = !!campaignUser.startedAt && campaignUser.status !== 'not_started'
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const hasNoExpiryDateForTimedCampaign = isTimedCampaign && !expiryDate && campaignUser.status === 'in_progress'
  const campaignClosedForUser = campaignClosed
    || campaignUserTimedOut || (isTimedCampaign && campaignUser.status === 'completed')
  const disableWorkshopActivityBasedOnProctoringSetting = proctoringEnabledOnWorkshopActivity
    ? campaignNeedsProctoring : isProctored

  const canNotStartPrework = campaignClosedForUser || campaignUser.status === 'completed'
  const canNotStartAssessment = campaignClosedForUser
    || campaignUser.status === 'completed'
    || campaignUserTimedOut
    || hasNoExpiryDateForTimedCampaign
    || !allPreworkIsComplete

  const canNotStartWorkshopActivity = campaignUser.status === 'completed'
    || campaignClosedForUser
    || disableWorkshopActivityBasedOnProctoringSetting
    || campaignUserTimedOut
    || !allPreworkIsComplete
  const canBeginCampaign = !campaignClosedForUser && hasAssessments && !hasStartedCampaign
    && !allAssessmentCompleteBasedOnWorkshopProctoringSetting
    && fixedTimed && !isCampaignInterrupted
  // eslint-disable-next-line max-len
  const canContinueCampaign = ((campaignNeedsProctoring && !canBeginCampaign) || isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !allAssessmentCompleteBasedOnWorkshopProctoringSetting
    && !campaignUserTimedOut && fixedTimed

  const allCampaignLevelAssessmentIds = _.flatten([
    ...groups.map(g => g.campaignAssessmentIds),
    campaign.ungroupedAssessmentsIds,
  ])

  const ungroupedAssessments = campaign.userAssessments.filter(
    ua => !_.includes(allCampaignLevelAssessmentIds, ua.assessmentId),
  )
  ungrouped = [...ungrouped, ...ungroupedAssessments]

  const proctoringMaintenanceSetting = maintenanceSettings?.find(
    ms => ms.subSystem === 'proctoring',
  )

  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>('')


  const asyncUrl = canBeginCampaign
    ? `/campaign_users/${campaignUser.id}/begin_campaign`
    : `/campaign_users/${campaignUser.id}/continue_campaign`

  const {
    asyncLoading,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: asyncUrl,
    data: { id: campaignUser.id },
    responseType: AsyncRequestResponseTR,
  })


  const handleResetPracticeCampaign = (campaignId) => {
    modal.confirm({
      title: I18n.t('campaign.restart_practice'),
      content: I18n.t('campaign.restart_practice_confirmation'),
      onOk () {
        resetPracticeCampaign(campaignId).then(() => {
          message.success(I18n.t('campaign.restart_practice_success'))
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const statusElement = (
    <Row gutter={[isMobile ? 32 : 64, 0]}>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.not_started')}
          StatusIcon={PlayCircleOutlined}
          count={counters.not_started || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.in_progress')}
          StatusIcon={ClockCircleOutlined}
          count={counters.in_progress || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.completed')}
          StatusIcon={CheckCircleOutlined}
          count={counters.completed || 0}
        />
      </Col>
    </Row>
  )

  if (campaignLevelProctoringEnabled && proctoringCheckInProgress) { return <Skeleton /> }

  return (
    <>
      {asyncLoading && <PageContentSkeleton />}
      {!asyncLoading
        && (
          <div>
            <CampaignPageHeader extra={statusElement} activeCampaignId={campaign.id} />
            {maintenanceStatus !== 'inProgress' && (
              <MaintenanceAlert
                maintenanceEnabled={proctoringEnabled}
                maintenanceSetting={proctoringMaintenanceSetting}
                maintenanceStatus={maintenanceStatus}
                onStatusChange={status => setMaintenanceStatus(status)}
              />
            )}
            <Row>
              <Col span={24}>
                {!campaignClosed && allAssessmentsComplete ? (
                  <Result
                    status="success"
                    title={I18n.t('campaign.thank_you_for_time')}
                    subTitle={
                        campaignsCount > 1
                          ? I18n.t('campaign.all_activities_are_completed_multiple')
                          : I18n.t('campaign.all_activities_are_completed')
                      }
                    extra={
                        campaignsCount > 1 && (
                          <Button href="/" type="link">
                            {I18n.t('campaign.goto_dashboard')}
                          </Button>
                        )
                      }
                    className={styles.resultContainer}
                  />
                ) : (
                  <>
                    {instructionsEnabled && (
                      <>
                        <InstructionsPanel
                          description={<SafeHTML html={instructions} config="adminRichText" />}
                          title=""
                          heightLimit={200}
                        />
                      </>
                    )}
                  </>
                )}
              </Col>
            </Row>
            <Row>
              <Col span={24} className={cs({ disabled: canNotStartAssessment })}>
                {campaignClosedForUser && (
                  <div className="mvm font-bold">
                    <AssessmentCardContainer>
                      <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
                    </AssessmentCardContainer>
                  </div>
                )}
                <div className={styles.tasksContainer}>
                  {maintenanceStatus === 'inProgress' && (
                    <MaintenanceAlert
                      maintenanceEnabled={proctoringEnabled}
                      maintenanceSetting={proctoringMaintenanceSetting}
                      maintenanceStatus={maintenanceStatus}
                      onStatusChange={status => setMaintenanceStatus(status)}
                    />
                  )}
                  {(canBeginCampaign || canContinueCampaign || campaign.practiceCampaign || hasFlashMessages) && (
                    <AssessmentCardContainer>
                      <Flash className="mt-2" />
                      <Row>
                        <Col span={24}>
                          {campaign.practiceCampaign && hasStartedCampaign && !isProctored && (
                            <>
                              <Title className={styles.beginText} level={4}>
                                {I18n.t('campaign.restart_practice')}
                              </Title>
                              <Button
                                size="middle"
                                type="primary"
                                onClick={() => handleResetPracticeCampaign(campaign.id)}
                                icon={<ReloadOutlined />}
                              >
                                {I18n.t('campaign.restart_practice')}
                              </Button>
                            </>
                          )}
                          {fixedTimed && !allPreworkIsComplete && (canBeginCampaign || canContinueCampaign) && (
                            <div className="mt-1">
                              <Space>
                                <InfoCircleOutlined />
                                <Typography.Text type="secondary">
                                  {I18n.t('enduser.prework_not_completed_message')}
                                </Typography.Text>
                              </Space>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </AssessmentCardContainer>
                  )}
                  <AssessmentsContainer
                    groups={groups}
                    ungrouped={ungrouped}
                    campaign={campaign}
                    canNotStartPrework={canNotStartPrework}
                    canNotStartAssessment={canNotStartAssessment}
                    canNotStartWorkshopActivity={canNotStartWorkshopActivity}
                    campaignNotStarted={canBeginCampaign || canContinueCampaign}
                    allPreworkIsComplete={allPreworkIsComplete}
                  />
                </div>
              </Col>
            </Row>
          </div>
        )
      }
    </>
  )
}


export const Common = connector(CommonComponent)
