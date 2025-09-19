import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col, Button, Space, theme, App, Typography,
} from 'antd'
import { connect, ConnectedProps, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { secondsToDayHoursAndMinutes, SECONDS_IN_HOUR } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { SafeHTML } from '~/components/SafeHTML'
import { shortify } from '~/utils/string'
import {
  reset as resetCampaign,
  resetPracticeCampaign,
  setCampaignUser,
  updateUserAssessmentStatus,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { STATUSES } from '~/constants/campaign'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'
import { CountdownTimer, DetailsCard, DirectionalArrowIcon } from '~/glint'
import {
  markMeetingAssessmentComplete,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'

import styles from './styles.less'
import { isProctored } from '~/utils/isProctored'

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
    },
  },
}) => {
  const {
    status, assessmentIconUrl, assessmentName, completionPercent, completionReason, id,
    timing, meetingLink, meetingTime, scheduleTime, workshopActivityDuration,
    requireScheduling, assessmentCategory,
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
  const { modal, message } = App.useApp()
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

  const canBeginCampaign = !campaignClosedForUser && !hasStartedCampaign
    && fixedTimed && !isCampaignInterrupted
  // eslint-disable-next-line max-len
  const canContinueCampaign = (isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !campaignUserTimedOut && fixedTimed

  let disableActionButton = disabled
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

  const campaignStartInstruction = () => {
    const messages = [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })]

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
    )
  }

  const asyncUrl = canBeginCampaign
    ? `/campaign_users/${campaignUser.id}/begin_campaign`
    : `/campaign_users/${campaignUser.id}/continue_campaign`

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

  const startCampaignActivities = async () => {
    try {
      const { responseData } = await makeAsyncRequest()
      dispatch(setCampaignUser(responseData))
      navigateToAssessment()
    } catch (error) {
      message.error(error)
    }
  }

  const handleStartCampaignActivities = () => {
    const needToBeginOrContinueCampaign = canBeginCampaign || canContinueCampaign
    if (
      (proctoringEnabledOnWorkshopActivity && isProctored()) || !isWorkshopActivity || !needToBeginOrContinueCampaign
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
        <span>
          <TruncatedTitle id={titleId} title={assessmentName} />
        </span>
      </Col>
    </Row>
  )

  const showMeetingInfo = meetingLink && workshopBooked && workshopAttended && isWorkshopActivity
  const footerElement = showMeetingInfo ? (
    <MeetingInfo
      meetingLink={meetingLink}
      meetingTime={meetingTime}
      userAssessmentId={userAssessment.id}
      assessmentCategory={assessmentCategory}
    />
  ) : null

  const workshopActivityDurationText = workshopActivityDuration
    ? secondsToDayHoursAndMinutes(workshopActivityDuration * 60, undefined, 'hr', 'mins') : ''
  const showDuration = timing || isWorkshopActivity
  const subtitleElement = (
    <Space direction="vertical">
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
        footer={footerElement}
      />
    </>
  )
}

type MeetingInfoProps = {
  meetingLink: string | null
  meetingTime: string | null
  userAssessmentId: number
  assessmentCategory?: string | null
}

interface StartTimeDisplayProps {
  userAssessment: UserAssessment
  onCountdownFinish: () => void
}

const StartTimeDisplay = ({ userAssessment, onCountdownFinish }: StartTimeDisplayProps) => {
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

const MeetingInfo: FC<MeetingInfoProps> = ({
  meetingLink, meetingTime, userAssessmentId, assessmentCategory,
}) => {
  const currentTime = dayjs.tz()
  const dispatch = useDispatch()
  const meetingTimeMomentObj = dayjs(meetingTime)
  const [canJoinMeeting, setCanJoinMeeting] = useState(
    meetingTime ? currentTime.isSameOrAfter(meetingTimeMomentObj) : true,
  )
  const secondsLeftToStartMeeting = meetingTimeMomentObj.diff(currentTime, 'seconds')
  const handleJoinClick = () => {
    dispatch(markMeetingAssessmentComplete(userAssessmentId)).then((response) => {
      dispatch(updateUserAssessmentStatus(response))
    })
  }

  return canJoinMeeting ? (
    <Button
      type="link"
      href={meetingLink || '#'}
      target="_blank"
      onClick={() => assessmentCategory === 'meeting' && handleJoinClick()}
    >
      {I18n.t('frontend.bookings.join_activity_meeting')}
      {' '}
      <DirectionalArrowIcon />
    </Button>
  ) : (
    <>
      <Space size={4}>
        {I18n.t('frontend.bookings.meeting_start_text')}
        <CountdownTimer
          seconds={secondsLeftToStartMeeting}
          onFinish={() => setCanJoinMeeting(true)}
        />
      </Space>
    </>
  )
}

export const AssessmentCard = connector(AssessmentCardComponent)
