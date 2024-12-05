import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col, Button, Space, theme,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { secondsToDayHoursAndMinutes, SECONDS_IN_HOUR } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { shortify } from '~/utils/string'
import { CountdownTimer, DetailsCard, DirectionalArrowIcon } from '~/glint'

import styles from './styles.less'

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

export const AssessmentCard: React.FC<Props> = ({
  userAssessment,
  view,
  disabled,
  prevCompleted,
  campaignNotStarted,
  workshopBooked,
  workshopAttended,
}) => {
  const {
    status, assessmentIconUrl, assessmentName, completionPercent,
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
  const isWorkshopActivity = userAssessment.workshopActivity
  const titleId = `assessment-card-title-${userAssessment.id}`

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

  const loadAssessment = ({ id }) => {
    setLoading(true)
    navigate(`/user_assessments/${id}`)
  }

  const iconUrl = assessmentIconUrl
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} alt={assessmentName} />
  ) : (
    <Avatar
      style={{ backgroundColor: token.colorPrimary }}
    >
      {shortify(assessmentName)}
    </Avatar>
  )

  if (completionPercent === 100) {
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
    <MeetingInfo meetingLink={meetingLink} meetingTime={meetingTime} />
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
        onButtonClick={() => loadAssessment(userAssessment)}
        subtitle={subtitleElement}
        footer={footerElement}
      />
    </>
  )
}

type MeetingInfoProps = {
  meetingLink: string | null
  meetingTime: string | null
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

const MeetingInfo: FC<MeetingInfoProps> = ({ meetingLink, meetingTime }) => {
  const currentTime = dayjs.tz()
  const meetingTimeMomentObj = dayjs(meetingTime)
  const [canJoinMeeting, setCanJoinMeeting] = useState(
    meetingTime ? currentTime.isSameOrAfter(meetingTimeMomentObj) : true,
  )
  const secondsLeftToStartMeeting = meetingTimeMomentObj.diff(currentTime, 'seconds')

  return canJoinMeeting ? (
    <Button type="link" href={meetingLink || '#'} target="_blank">
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
