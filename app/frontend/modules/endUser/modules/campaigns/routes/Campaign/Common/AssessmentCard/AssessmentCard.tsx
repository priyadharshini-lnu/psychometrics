import React, { FC, useState } from 'react'
import {
  Avatar, Row, Col, Button, Space,
} from 'antd'
import { useHistory } from 'react-router-dom'
import moment from 'moment-timezone'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'

import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TruncatedTitle } from '~/modules/endUser/modules/campaigns/components/TruncatedTitle'
import { shortify } from '~/utils/string'
import { CountdownTimer, DetailsCard, DirectionalArrowIcon } from '~/glint'

import styles from './styles.less'

const { I18n } = window

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
  } = userAssessment
  let taskStatus = status
  const [loading, setLoading] = useState(false)
  const scheduleTimeMomentObj = moment(scheduleTime)
  const currentTime = moment.tz()
  const [withinActivityScheduleTime, setWithinActivityScheduleTime] = useState(
    scheduleTime ? currentTime.isSameOrAfter(scheduleTimeMomentObj) : false,
  )
  const history = useHistory()
  const isWorkshopActivity = userAssessment.workshopActivity
  const disableActionButton = isWorkshopActivity
    ? disabled || !withinActivityScheduleTime || !workshopBooked || !workshopAttended : disabled

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
    history.push(`/user_assessments/${id}`)
  }

  const iconUrl = assessmentIconUrl
  const assessmentIcon = iconUrl ? (
    <Avatar src={iconUrl} />
  ) : (
    <Avatar
      className={styles.titleAvatar}
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
          <TruncatedTitle title={assessmentName} />
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
  const secondsLeftToStartWorkshopActivity = scheduleTimeMomentObj.diff(currentTime, 'seconds')

  const subtitleElement = (
    <Space direction="vertical">
      {
        showDuration ? <TimerText text={isWorkshopActivity ? workshopActivityDurationText : timing} /> : null
      }
      {!withinActivityScheduleTime && workshopBooked && secondsLeftToStartWorkshopActivity ? (
        <Space size={4}>
          {I18n.t('frontend.bookings.activity_start_text')}
          <CountdownTimer
            seconds={secondsLeftToStartWorkshopActivity}
            onFinish={() => setWithinActivityScheduleTime(true)}
          />
        </Space>
      ) : null}
    </Space>
  )

  return (
    <>
      <DetailsCard
        status={statusElement}
        showStatusAtTop={view === 'list'}
        title={titleElement}
        progressPercentage={completionPercent || 0}
        buttonText={buttonTextData[status]}
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

const MeetingInfo: FC<MeetingInfoProps> = ({ meetingLink, meetingTime }) => {
  const currentTime = moment.tz()
  const meetingTimeMomentObj = moment(meetingTime)
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
