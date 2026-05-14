import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col, Space, theme, App,
  Tag, Alert, Tooltip,
  Typography,
} from 'antd'
import { connect, ConnectedProps, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CountdownTimer, DetailsCard,
} from '~/glint'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { secondsToDayHoursAndMinutes, SECONDS_IN_HOUR } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
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
import SafeHTML from '~/components/SafeHTML/SafeHTML'

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

const AssessmentCardComponent: React.FC<CommonComponentProps> = ({
  userAssessment,
  view,
  disabled,
  prevCompleted,
  campaignNotStarted,
  workshopBooked,
  workshopAttended,
  campaign,
  campaign: {
    campaignUser, isTimedCampaign, fixedTimed, campaignTime,
    campaignOptions: {
      proctoringEnabledOnWorkshopActivity,
      selectiveProctoringEnabled,
    },
  },
}) => {
  const { isProctored } = useIsProctored()
  const {
    status, assessmentIconUrl, assessmentName, completionPercent, completionReason, id,
    timing, meetingLink, meetingTime, scheduleTime, workshopActivityDuration,
    requireScheduling, assessmentCategory, isTimed: timedAssessment,
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

  const canBeginCampaign = !campaignClosedForUser && !hasStartedCampaign
    && fixedTimed && !isCampaignInterrupted

  const canContinueCampaign = (isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !campaignUserTimedOut && fixedTimed

  let disableActionButton = disabled || isAssessmentProctoringMisconfigured
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

  const campaignStartInstruction = () => {
    const messages = [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })]

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
    )
  }

  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: asyncUrl,
    data: { id: campaignUser.id, continue_without_proctoring: true },
    responseType: AsyncRequestResponseTR,
  })


  const navigateToAssessment = () => {
    setLoading(true)
    navigate(`/user_assessments/${id}`)
  }

  const startCampaignActivities = async (shouldNavigate = true) => {
    try {
      const { responseData } = await makeAsyncRequest()
      dispatch(setCampaignUser(responseData))
      if (shouldNavigate) {
        navigateToAssessment()
      }
    } catch (error) {
      message.error(error)
      throw error
    }
  }


  const handleStartCampaignActivities = () => {
    const needToBeginOrContinueCampaign = canBeginCampaign || canContinueCampaign
    if (
      (proctoringEnabledOnWorkshopActivity && isProctored)
      || (!isWorkshopActivity)
      || (!needToBeginOrContinueCampaign)
    ) {
      return navigateToAssessment()
    }
    if (!fixedTimed) { return startCampaignActivities() }

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
        buttonText={assessmentCategory === 'meeting' ? null : buttonTextData[status]}
        buttonId={`assessment-card-btn-${userAssessment.id}`}
        actionDisabled={disableActionButton}
        actionLoading={loading}
        actionDisabledText={actionDisabledText}
        onButtonClick={handleStartCampaignActivities}
        subtitle={subtitleElement}
        description={isAssessmentProctoringMisconfigured && (
          <Alert
            className="ta-s"
            title={(
              <Space>
                {I18n.t('enduser.assessment_misconfigured')}
                <Tooltip
                  title={I18n.t('enduser.proctored_assessment_misconfigured_msg')}
                >
                  <span><InfoCircleOutlined /></span>
                </Tooltip>
              </Space>
          )}
            type="warning"
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
