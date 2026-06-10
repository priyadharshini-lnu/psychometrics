import { FC, useState } from 'react'
import { Button, Space } from 'antd'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { DirectionalArrowIcon, CountdownTimer } from '~/glint'
import { markMeetingAssessmentComplete } from '~/modules/endUser/modules/campaigns/core/userAssessment'
import { updateUserAssessmentStatus } from '~/modules/endUser/modules/campaigns/core/campaign'

export type MeetingInfoProps = {
  meetingLink: string | null
  meetingTime: string | null
  userAssessmentId: number
  assessmentCategory?: string | null
}

const { I18n } = window

export const MeetingInfo: FC<MeetingInfoProps> = ({
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
          safeTimer
        />
      </Space>
    </>
  )
}
