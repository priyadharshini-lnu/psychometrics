import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Button, Space, Typography,
} from 'antd'
import moment from 'moment-timezone'
import cs from 'classnames'

import { secondsToDayHoursAndMinutes } from '~/utils/time'
import {
  DetailsCard, DirectionalArrowIcon, CountdownTimer, DirectionalNavigateIcon,
} from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'

import styles from './InviteDetailsContainer.less'

const { Title } = Typography
const { I18n } = window

export const InviteDeatilsContainer = ({ inviteDetails, bookingDetails }) => {
  const history = useHistory()
  const currentTime = moment.tz()
  const bookingStartTimeMomentObj = moment(bookingDetails?.startTime)
  const [canJoinMeeting, setCanJoinMeeting] = useState(currentTime.isAfter(bookingStartTimeMomentObj))
  const secondsLeftToStartAssessmentCenter = bookingStartTimeMomentObj.diff(currentTime, 'seconds')
  const totalInvites = inviteDetails?.totalInvites || 0
  const otherInvitesCount = totalInvites - 1
  const workshopMeetingLink = bookingDetails?.meetingLink || ''

  if (bookingDetails) {
    if (canJoinMeeting && !workshopMeetingLink) {
      return null
    }
    return (
      <div className={cs(styles.bookingCountdown, 'ta-c')}>
        {canJoinMeeting ? (
          <Button type="link" href={workshopMeetingLink} target="_blank">
            <Title level={5} className="mb-0">
              {I18n.t('frontend.bookings.join_workshop_meeting')}
              {' '}
              <DirectionalArrowIcon className="fs-12" />
            </Title>
          </Button>
        ) : (
          <>
            <p className="mb-0">{I18n.t('frontend.bookings.workshop_start_text')}</p>
            <Title level={5} className="mb-0">
              <CountdownTimer
                seconds={secondsLeftToStartAssessmentCenter}
                onFinish={() => setCanJoinMeeting(true)}
                className={styles.countdown}
              />
            </Title>
          </>
        ) }
      </div>
    )
  }
  return (
    <>
      {inviteDetails ? (
        <Space size={6} className="w-100" direction="vertical">
          <p className="mb-0">{I18n.t('frontend.bookings.accept_invite_msg')}</p>
          <DetailsCard
            title={inviteDetails.title}
            subtitle={(
              <TimerText text={secondsToDayHoursAndMinutes(
                inviteDetails.duration, undefined, 'hr', 'mins',
              )}
              />
            )}
            description={inviteDetails.description}
            buttonText={I18n.t('frontend.bookings.buttons.reserve_spot')}
            className={styles.inviteCard}
            hideTitleHighlighter
            onButtonClick={() => history.push(`/invites/${inviteDetails.id}/details?type=invite`)}
          />
          {totalInvites > 1 ? (
            <Button
              type="link"
              onClick={() => history.push('/invites')}
              className="ps-0 pt-0"
            >
              {otherInvitesCount > 1
                ? I18n.t('frontend.bookings.other_invites', { count: otherInvitesCount })
                : I18n.t('frontend.bookings.other_invite', { count: otherInvitesCount })}
              <DirectionalNavigateIcon />
            </Button>
          ) : null}
        </Space>
      ) : null}
    </>
  )
}
