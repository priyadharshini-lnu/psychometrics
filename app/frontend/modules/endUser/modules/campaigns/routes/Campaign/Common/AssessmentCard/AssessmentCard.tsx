import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col, Space, theme, App,
  Tag, Alert, Tooltip, Typography,
} from 'antd'
import { connect, ConnectedProps, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useDeviceDetection } from '~/hooks/useDeviceDetection'
import {
  CountdownTimer, DetailsCard,
} from '~/glint'
import { InfoCircleOutlined, InfoCircleFilled } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { secondsToDayHoursAndMinutes, SECONDS_IN_HOUR } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { SafeHTML } from '~/components/SafeHTML'
import { MeetingInfo } from './MeetingInfo'
import { shortify } from '~/utils/string'
import {
  reset as resetCampaign,
  resetPracticeCampaign,
  setCampaignUser,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { STATUSES } from '~/constants/campaign'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'

import styles from './styles.less'
import { useIsProctored } from '~/hooks/useProctoringState'

const { I18n } = window
const { useToken } = theme

interface Props {
  userAssessment: UserAssessment
  view: string
  disabled: boolean
  campaignNotStarted: boolean
  prevCompleted: boolean
  workshopBooked?: boolean
  workshopAttended?: boolean
  allPreworkIsComplete?: boolean
}

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    instructions: state.campaigns.campaign.instructions,
    currentUser: state.currentUser,
    privacyConsentRequired: state.campaigns.campaign?.privacyConsentRequired,
  }),
  {
    resetCampaign,
    resetPracticeCampaign,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type CommonComponentProps = PropsFromRedux & Props

const isCampaignSystemCheckValid = (
  lastSuccessfulCheckAt: number,
  systemCheckValidity: number,
) => {
  const campaignSystemCheckExpiryTime = lastSuccessfulCheckAt + systemCheckValidity
  return campaignSystemCheckExpiryTime > (Date.now() / 1000)
}

const AssessmentCardComponent: React.FC<CommonComponentProps> = ({
  userAssessment,
  view,
  disabled,
  prevCompleted,
  campaignNotStarted,
  allPreworkIsComplete,
  workshopBooked,
  workshopAttended,
  campaign,
  campaign: {
    campaignUser, isTimedCampaign, fixedTimed, campaignTime, lastSuccessfulCheckAt,
    campaignOptions: {
      proctoringEnabledOnWorkshopActivity, integrationType, enableMobileProctoring,
      selectiveProctoringEnabled, proctoringEnabled, systemCheckEnabled, systemCheckValidity,
    },
  },
}) => {
  const { isProctored } = useIsProctored()
  const {
    status, assessmentIconUrl, assessmentName, completionPercent, completionReason, id,
    timing, meetingLink, meetingTime, scheduleTime, workshopActivityDuration,
    requireScheduling, assessmentCategory, isTimed: timedAssessment, type: assessmentType,
    prework,
  } = userAssessment
  let taskStatus = status
  const [loading, setLoading] = useState(false)
  const { token } = useToken()
  const scheduleTimeMomentObj = dayjs(scheduleTime)
  const currentTime = dayjs.tz()
  const [withinActivityScheduleTime, setWithinActivityScheduleTime] = useState(
    scheduleTime ? currentTime.isSameOrAfter(scheduleTimeMomentObj) : false,
  )
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const dispatch = useDispatch()
  const { isMobileDevice } = useDeviceDetection()
  const isWorkshopActivity = userAssessment.workshopActivity
  const titleId = `assessment-card-title-${userAssessment.id}`
  const hasStartedCampaign = !!campaignUser.startedAt && campaignUser.status !== 'not_started'
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const campaignClosedForUser = campaignClosed
    || campaignUserTimedOut || (isTimedCampaign && campaignUser.status === 'completed')
  const hasNoExpiryDateForTimedCampaign = isTimedCampaign && !campaignUser?.expiryDate
    && campaignUser.status === 'in_progress'
  const assessementLevelPrococtoringEnabled = selectiveProctoringEnabled && userAssessment.proctoringEnabled
  const assessmentNeedsProctoring = assessementLevelPrococtoringEnabled && !isProctored
  const isAssessmentProctoringMisconfigured = assessmentNeedsProctoring && !timedAssessment
  const isMicrositeAssessment = assessmentType === 'microsite'
  const campaignLevelProctoringEnabled = proctoringEnabled && !selectiveProctoringEnabled
  const campaignNeedsProctoring = campaignLevelProctoringEnabled && !isProctored

  const canBeginCampaign = !campaignClosedForUser && !hasStartedCampaign
    && fixedTimed && !isCampaignInterrupted

  const canContinueCampaign = (isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !campaignUserTimedOut && fixedTimed

  let disableActionButton = disabled || isAssessmentProctoringMisconfigured || isMicrositeAssessment
  if (isWorkshopActivity) {
    disableActionButton ||= disabled || !withinActivityScheduleTime || !workshopBooked || !workshopAttended
  } else if (requireScheduling || scheduleTime) {
    disableActionButton ||= !withinActivityScheduleTime
  }

  let actionDisabledText = ''
  if (!prevCompleted) {
    actionDisabledText = I18n.t('campaign.complete_prev')
  }
  if (campaignNotStarted) {
    actionDisabledText = I18n.t('campaign.begin_campaign_msg')
  }
  if (!allPreworkIsComplete) {
    actionDisabledText = I18n.t('enduser.complete_prework_message')
  }
  if (isMicrositeAssessment) {
    actionDisabledText = I18n.t('enduser.microsite_assessment_external')
  }

  const buttonTextData = {
    in_progress: I18n.t('assessments.card_actions.continue'),
    completed: '',
    not_started: I18n.t('assessments.card_actions.begin'),
    timed_out: '',
    interrupted: I18n.t('assessments.card_actions.continue'),
  }

  const asyncUrl = canBeginCampaign
    ? `/campaign_users/${campaignUser.id}/begin_campaign`
    : `/campaign_users/${campaignUser.id}/continue_campaign`

  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: asyncUrl,
    data: { id: campaignUser.id, continue_without_proctoring: !campaignNeedsProctoring },
    responseType: AsyncRequestResponseTR,
  })

  const campaignStartInstruction = () => {
    const messages = isTimedCampaign && campaignTime
      ? [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })] : []
    if (campaignNeedsProctoring) {
      messages.push(I18n.t('campaign.instruction_modal.common_proctoring_instructions'))
      integrationType === 'ldb' && messages.push(I18n.t('campaign.instruction_modal.lockdown_browser_instruction'))
    }

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
    )
  }


  const navigateToAssessment = () => {
    setLoading(true)
    navigate(`/user_assessments/${id}`)
  }

  const startCampaignActivities = async (shouldNavigate = true) => {
    try {
      const { responseData } = await makeAsyncRequest()
      const { examusSessionUrl } = responseData

      if (campaignLevelProctoringEnabled && examusSessionUrl) {
        window.location.href = examusSessionUrl
      } else {
        dispatch(setCampaignUser(responseData))
        if (shouldNavigate) {
          navigateToAssessment()
        }
      }
    } catch (error) {
      message.error(error)
      throw error
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
      async onOk () {
        if (campaignNeedsProctoring || canBeginCampaign || canContinueCampaign) {
          await startCampaignActivities(true)
        }
      },
    })
  }

  const handleStartCampaignActivities = () => {
    if (systemCheckEnabled
      && !isCampaignSystemCheckValid(lastSuccessfulCheckAt, systemCheckValidity)) {
      navigate(`/campaign_system_check/${campaign.id}/welcome`)
      return
    }
    const needToBeginOrContinueCampaign = (canBeginCampaign || canContinueCampaign) && !prework
    if (
      (proctoringEnabledOnWorkshopActivity && isProctored)
      || (!needToBeginOrContinueCampaign && (!campaignNeedsProctoring || prework))
    ) {
      return navigateToAssessment()
    }
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

  const iconUrl = assessmentIconUrl
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} alt="" />
  ) : (
    <Avatar
      style={{ backgroundColor: token.colorPrimary }}
    >
      {shortify(assessmentName)}
    </Avatar>
  )

  if (completionReason && completionReason === 'time_out_offline') {
    taskStatus = 'timed_out'
  } else if (completionPercent === 100) {
    taskStatus = 'completed'
  }

  const statusElement = <StatusText taskStatus={taskStatus} />

  const titleElement = (
    <Row wrap={false}>
      <Col>{assessmentIcon}</Col>
      <Col className={styles.assessmentLabel}>
        <Space>
          <TruncatedTitle id={titleId} title={assessmentName} />
          {assessementLevelPrococtoringEnabled && <Tag color="volcano">{I18n.t('enduser.proctored')}</Tag>}
          {prework && <Tag color="blue">{I18n.t('enduser.prework')}</Tag>}
        </Space>
      </Col>
    </Row>
  )

  const showMeetingInfo = meetingLink && workshopBooked && workshopAttended && isWorkshopActivity

  const workshopActivityDurationText = workshopActivityDuration
    ? secondsToDayHoursAndMinutes(workshopActivityDuration * 60, undefined, 'hr', 'mins') : ''
  const showDuration = timing || isWorkshopActivity
  const subtitleElement = (
    <Space orientation="vertical">
      {
        showDuration ? (

          <TimerText
            textType="none"
            text={isWorkshopActivity ? workshopActivityDurationText : timing}
          />
        ) : null
      }
      <StartTimeDisplay userAssessment={userAssessment} onCountdownFinish={() => setWithinActivityScheduleTime(true)} />
    </Space>
  )


  return (
    <>
      <DetailsCard
        status={statusElement}
        showStatusAtTop={view === 'list'}
        title={titleElement}
        titleId={titleId}
        titleHeadingLevel={2}
        progressPercentage={assessmentCategory === 'meeting' ? undefined : completionPercent || 0}
        progressLabelAria={I18n.t('frontend.aria.task_progress_label')}
        buttonText={assessmentCategory === 'meeting' || isMicrositeAssessment ? null : buttonTextData[status]}
        buttonId={`assessment-card-btn-${userAssessment.id}`}
        actionDisabled={disableActionButton}
        actionLoading={loading}
        actionDisabledText={actionDisabledText}
        onButtonClick={handleStartCampaignActivities}
        subtitle={subtitleElement}
        description={(isAssessmentProctoringMisconfigured || isMicrositeAssessment) && (
          <Alert
            className="ta-s"
            title={(
              <Space>
                {isMicrositeAssessment
                  ? I18n.t('enduser.microsite_assessment_external')
                  : I18n.t('enduser.assessment_misconfigured')}
                {!isMicrositeAssessment && (
                  <Tooltip
                    title={I18n.t('enduser.proctored_assessment_misconfigured_msg')}
                  >
                    <span><InfoCircleOutlined /></span>
                  </Tooltip>
                )}
              </Space>
          )}
            type={isMicrositeAssessment ? 'info' : 'warning'}
            showIcon
          />
        )}
        footer={showMeetingInfo ? (
          <MeetingInfo
            meetingLink={meetingLink}
            meetingTime={meetingTime}
            userAssessmentId={id}
            assessmentCategory={assessmentCategory}
          />
        ) : null}
      />
    </>
  )
}

interface StartTimeDisplayProps {
  userAssessment: UserAssessment
  onCountdownFinish: () => void
}

const StartTimeDisplay: FC<StartTimeDisplayProps> = ({ userAssessment, onCountdownFinish }) => {
  const { scheduleTime } = userAssessment
  if (!scheduleTime) return null
  const scheduleTimeMomentObj = dayjs(scheduleTime)
  const secondsLeftForScheduleTime = scheduleTimeMomentObj.diff(dayjs(), 'seconds')

  if (secondsLeftForScheduleTime <= 0) return null
  if (secondsLeftForScheduleTime >= SECONDS_IN_HOUR) {
    return (
      <div className="mb-1">
        {I18n.t('frontend.bookings.starts_at', { date: scheduleTimeMomentObj.format('Do MMMM YYYY hh:mm A') })}
      </div>
    )
  }
  if (secondsLeftForScheduleTime < SECONDS_IN_HOUR) {
    return (
      <Space size={4}>
        {I18n.t('frontend.bookings.starts_in')}
        <CountdownTimer
          seconds={secondsLeftForScheduleTime}
          onFinish={onCountdownFinish}
        />
      </Space>
    )
  }

  return null
}

export const AssessmentCard = connector(AssessmentCardComponent)
