import _ from 'lodash'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Space, Typography,
} from 'antd'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'

import { secondsToDayHoursAndMinutes } from '~/utils/time'
import {
  DetailsCard, DirectionalArrowIcon, CountdownTimer, DirectionalNavigateIcon,
} from '~/glint'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'

import styles from './InviteDetailsContainer.less'

const { Title } = Typography
const { I18n } = window

export const InviteDeatilsContainer = ({
  inviteDetails, bookingDetails, groupId, groupTitleId,
}) => {
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const currentTime = dayjs.tz()
  const bookingStartTimeMomentObj = dayjs(bookingDetails?.startTime)
  const [canJoinMeeting, setCanJoinMeeting] = useState(currentTime.isAfter(bookingStartTimeMomentObj))
  const secondsLeftToStartAssessmentCenter = bookingStartTimeMomentObj.diff(currentTime, 'seconds')
  const totalInvites = inviteDetails?.totalInvites || 0
  const otherInvitesCount = totalInvites - 1
  const workshopMeetingLink = bookingDetails?.meetingLink || ''

  const navigateToAssessmentCenterDetails = () => {
    navigate(`/campaigns/${campaignId}?assessmentCenterId=${groupId}`)
  }

  const detailsLink = (
    <Button
      id={`ac-details-btn-${groupId}`}
      className="ta-c mt-2"
      size="small"
      type="primary"
      onClick={navigateToAssessmentCenterDetails}
      aria-labelledby={`${groupTitleId} ac-details-btn-${groupId}`}
    >
      {I18n.t('common.actions.view_activities')}
      <DirectionalArrowIcon className="fs-12" />
    </Button>
  )

  if (!_.isEmpty(bookingDetails)) {
    if (canJoinMeeting && !workshopMeetingLink) {
      return <>{detailsLink}</>
    }
    return (
      <div className={cs('ta-c')}>
        {canJoinMeeting ? (
          <Space>
            {detailsLink}
            <Button type="link" href={workshopMeetingLink} target="_blank">
              <Title level={5} className="mb-0">
                {I18n.t('frontend.bookings.join_workshop_meeting')}
                {' '}
                <DirectionalArrowIcon className="fs-12" />
              </Title>
            </Button>
          </Space>
        ) : (
          <>
            <p className="mb-0">{I18n.t('frontend.bookings.workshop_start_text')}</p>
            <Title level={5} className="mb-0 mt-0">
              <CountdownTimer
                seconds={secondsLeftToStartAssessmentCenter}
                onFinish={() => setCanJoinMeeting(true)}
                className={styles.countdown}
              />
            </Title>
            {detailsLink}
          </>
        ) }
      </div>
    )
  }
  return (
    <>
      {inviteDetails ? (
        <Space size={6} className="w-100" direction="vertical">
          <p className="mb-0 ta-c">{I18n.t('frontend.bookings.accept_invite_msg')}</p>
          <DetailsCard
            title={inviteDetails.title}
            subtitle={(
              <TimerText
                textType="none"
                text={secondsToDayHoursAndMinutes(
                  inviteDetails.duration, undefined, 'hr', 'mins',
                )}
              />
            )}
            description={inviteDetails.description}
            buttonText={I18n.t('frontend.bookings.buttons.reserve_spot')}
            className={styles.inviteCard}
            hideTitleHighlighter
            onButtonClick={() => navigate(`/invites/${inviteDetails.id}/details?type=invite`)}
            secondaryBtnText={I18n.t('common.actions.view_activities')}
            onSecondaryBtnClick={navigateToAssessmentCenterDetails}
          />
          {totalInvites > 1 ? (
            <Button
              type="link"
              onClick={() => navigate('/invites')}
              className="ps-0 pt-0"
            >
              {otherInvitesCount > 1
                ? I18n.t('frontend.bookings.other_invites', { count: otherInvitesCount })
                : I18n.t('frontend.bookings.other_invite', { count: otherInvitesCount })}
              <DirectionalNavigateIcon />
            </Button>
          ) : null}
        </Space>
      ) : (
        <>
          <p>{I18n.t('frontend.bookings.no_invites_msg')}</p>
          {detailsLink}
        </>
      )}
    </>
  )
}
