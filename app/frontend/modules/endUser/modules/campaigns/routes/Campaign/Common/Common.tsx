import {
  FC, useContext, useState,
} from 'react'
import {
  connect, ConnectedProps, useDispatch, useSelector,
} from 'react-redux'
import _ from 'lodash'
import {
  Row, Col, Alert, Button, Result, Typography, Space, App,
  Skeleton, theme,
} from 'antd'
import cs from 'classnames'
import {
  InfoCircleOutlined, InfoCircleFilled,
  PlayCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'

import { STATUSES } from '~/constants/campaign'
import { Flash } from '~/components/Flash'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  reset as resetCampaign,
  resetPracticeCampaign,
  setCampaignUser,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { acceptPolicy } from '~/modules/endUser/modules/campaigns/core/project'

import { SafeHTML } from '~/components/SafeHTML'
import { useIsProctored } from '~/hooks/useProctoringState'
import { useDeviceDetection } from '~/hooks/useDeviceDetection'
import { ProgressStatus, DirectionalArrowIcon, MediaQueryContext } from '~/glint'
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
      instructionsEnabled, instructions, proctoringEnabled, integrationType, proctoringEnabledOnWorkshopActivity,
      enableMobileProctoring,
    },
    campaignTime,
  } = campaign

  const dispatch = useDispatch()
  const hasFlashMessages = useSelector((state: RootState) => state.flash?.length > 0)
  const { token } = theme.useToken()
  const { isProctored, proctoringCheckInProgress } = useIsProctored()
  const needsProctoring = proctoringEnabled && !isProctored
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
    ? needsProctoring : isProctored

  const canNotStartPrework = campaignClosedForUser || campaignUser.status === 'completed'
  const canNotStartAssessment = needsProctoring
    || (fixedTimed && !hasStartedCampaign)
    || campaignClosedForUser
    || campaignUser.status === 'completed'
    || isCampaignInterrupted
    || campaignUserTimedOut
    || hasNoExpiryDateForTimedCampaign
  const canNotStartWorkshopActivity = campaignUser.status === 'completed'
    || campaignClosedForUser
    || disableWorkshopActivityBasedOnProctoringSetting
    || campaignUserTimedOut
    || !allPreworkIsComplete
  const canBeginCampaign = !campaignClosedForUser && hasAssessments && !hasStartedCampaign
    && !allAssessmentCompleteBasedOnWorkshopProctoringSetting
    && fixedTimed && !isCampaignInterrupted
  // eslint-disable-next-line max-len
  const canContinueCampaign = ((needsProctoring && !canBeginCampaign) || isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
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
  const proctoringUnderMaintenance = proctoringEnabled && maintenanceStatus === 'inProgress'
  const { isMobileDevice } = useDeviceDetection()

  const campaignStartInstruction = () => {
    const messages = [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })]
    if (proctoringEnabled) { messages.push(I18n.t('campaign.instruction_modal.common_proctoring_instructions')) }

    if (integrationType === 'ldb') { messages.push(I18n.t('campaign.instruction_modal.lockdown_browser_instruction')) }

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map((message, index) => (
        <Typography.Paragraph key={index}>
          <SafeHTML html={message} />
        </Typography.Paragraph>
      ))
    )
  }

  const asyncUrl = canBeginCampaign
    ? `/campaign_users/${campaignUser.id}/begin_campaign`
    : `/campaign_users/${campaignUser.id}/continue_campaign`

  const {
    asyncLoading, makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: asyncUrl,
    data: { id: campaignUser.id },
    responseType: AsyncRequestResponseTR,
  })

  const startCampaignActivities = async () => {
    try {
      const { responseData } = await makeAsyncRequest()
      const { examusSessionUrl } = responseData

      if (proctoringEnabled && examusSessionUrl) {
        window.location.href = examusSessionUrl
      } else {
        dispatch(setCampaignUser(responseData))
      }
    } catch (error) {
      message.error(error)
    }
  }

  const showCampaignStartModal = () => {
    modal.info({
      icon: false,
      title: null,
      content: campaignStartInstruction(),
      okText: I18n.t('common.actions.start'),
      closable: true,
      width: 600,
      onOk () {
        startCampaignActivities()
      },
    })
  }

  const handleStartCampaignActivities = () => {
    if (!fixedTimed) { return startCampaignActivities() }

    if (isMobileDevice && proctoringEnabled) {
      if (enableMobileProctoring) {
        modal.confirm({
          icon: <InfoCircleFilled style={{ color: token.colorInfo }} />,
          title: I18n.t('shared.desktop_or_laptop_recommended'),
          content: (
            <Typography.Paragraph>
              <SafeHTML html={I18n.t('shared.mobile_proctoring_enabled_instructions')} />
            </Typography.Paragraph>
          ),
          closable: true,
          width: 600,
          okText: I18n.t('common.actions.continue'),
          cancelText: I18n.t('shared.switch_to_laptop_or_desktop'),
          cancelButtonProps: { color: 'primary', variant: 'outlined' },
          onOk: () => showCampaignStartModal(),
        })
      } else {
        modal.info({
          icon: false,
          title: I18n.t('shared.desktop_or_laptop_required'),
          content: (
            <Typography.Paragraph>
              <SafeHTML html={I18n.t('shared.mobile_proctoring_disabled_instructions')} />
            </Typography.Paragraph>
          ),
          closable: true,
          width: 600,
        })
      }
    } else {
      showCampaignStartModal()
    }

    return null
  }

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

  const timedAndProctoredAlert = maintenanceStatus !== 'inProgress' && (canBeginCampaign || canContinueCampaign) ? (
    <Alert
      className="mt-2"
      type="warning"
      title={
        getBeginOrContinueMessage(
          fixedTimed, proctoringEnabled,
          canBeginCampaign ? I18n.t('campaign.begin') : I18n.t('campaign.continue'),
        )
      }
    />
  ) : null

  if (proctoringEnabled && proctoringCheckInProgress) { return <Skeleton /> }

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
                      {timedAndProctoredAlert}
                      <Row>
                        <Col span={24} style={{ paddingInlineStart: '14px' }}>
                          {canBeginCampaign && (
                            <>
                              <Title className={styles.beginText} level={4}>
                                {I18n.t('campaign.begin')}
                              </Title>
                              <Button
                                size="middle"
                                type="primary"
                                onClick={handleStartCampaignActivities}
                                disabled={!allPreworkIsComplete || proctoringUnderMaintenance}
                              >
                                {I18n.t('campaign.begin')}
                                {' '}
                                <DirectionalArrowIcon />
                              </Button>
                            </>
                          )}
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
                          {canContinueCampaign && (
                            <>
                              <Title className={styles.beginText} level={4}>
                                {I18n.t('campaign.continue')}
                              </Title>
                              <Button
                                size="middle"
                                type="primary"
                                onClick={handleStartCampaignActivities}
                                disabled={!allPreworkIsComplete || proctoringUnderMaintenance}
                              >
                                {I18n.t('campaign.continue')}
                                {' '}
                                <DirectionalArrowIcon />
                              </Button>

                            </>
                          )}
                          {fixedTimed && !allPreworkIsComplete && (canBeginCampaign || canContinueCampaign) && (
                            <div className="mt-1">
                              <Space>
                                <InfoCircleOutlined />
                                <Typography.Text type="secondary">
                                  {I18n.t('campaign.begin_btn_msg_before_prework')}
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

const getBeginOrContinueMessage = (
  fixedTimed: boolean,
  proctoringEnabled: boolean,
  buttonText: string,
) => {
  if (fixedTimed && proctoringEnabled) {
    return I18n.t('enduser.start_campaign_message_timed_proctored', { buttonText })
  }
  if (proctoringEnabled) {
    return I18n.t('enduser.start_campaign_message_proctored', { buttonText })
  }
  if (fixedTimed) {
    return I18n.t('enduser.start_campaign_message_timed', { buttonText })
  }
  return ''
}


export const Common = connector(CommonComponent)
