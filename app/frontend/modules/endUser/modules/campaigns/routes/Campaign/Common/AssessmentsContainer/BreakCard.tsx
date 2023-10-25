import { FC } from 'react'
import moment, { Moment } from 'moment-timezone'
import { Col, Space } from 'antd'
import { ClockCircleFilled } from '@ant-design/icons'
import { DetailsCard } from '~/glint'
import { UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { StatusText } from '~/modules/endUser/modules/campaigns/components/StatusText'
import { TimerText } from '~/modules/endUser/modules/campaigns/components/TimerText'
import styles from './BreakCard.less'

type Props = {
  currentWorkshopActivity: UserAssessment
  nextWorkshopActivity: UserAssessment
  tabCol: number
  deskCol: number
}

const MINIMUM_BREAK_DURATION = 5

const { I18n } = window

export const BreakCard: FC<Props> = ({
  currentWorkshopActivity, nextWorkshopActivity, tabCol, deskCol,
}) => {
  const breakData = getWorkshopActivityBreakData(currentWorkshopActivity, nextWorkshopActivity)

  if (!breakData) return null

  const startTimeText = getTimeText(breakData.startTime)
  const endTimeText = getTimeText(breakData.endTime)

  const subTitle = <TimerText containerClassName="items-start" text={`${startTimeText} - ${endTimeText}`} />
  const title = (
    <Space>
      <ClockCircleFilled className={styles.breakIcon} />
      {I18n.t('frontend.break_time')}
    </Space>
  )

  return (
    <Col xs={24} sm={tabCol} md={tabCol} lg={tabCol} xl={deskCol} key={`${currentWorkshopActivity.id}_break`}>
      <DetailsCard
        title={title}
        status={breakData.inProgress ? <StatusText taskStatus="in_progress" /> : undefined}
        subtitle={subTitle}
      />
    </Col>
  )
}

const getTimeText = (time: Moment) => {
  const currentTime = moment.tz()
  const isActivityHappeningToday = currentTime.diff(time, 'days') === 0
  return isActivityHappeningToday
    ? time.clone().format('h:mmA') : time.clone().format('MMMM DD, YYYY, h:mmA')
}

const getEarliestDate = (dateOne:Moment, dateTwo:Moment) => {
  if (!dateOne.isValid()) {
    return dateTwo
  }
  if (!dateTwo.isValid()) {
    return dateOne
  }
  return dateOne.isBefore(dateTwo) ? dateOne : dateTwo
}

const getWorkshopActivityBreakData = (currentWorkshopActivity, nextWorkshopActivity) => {
  const currentTime = moment.tz()

  if (!currentWorkshopActivity.scheduleTime || !nextWorkshopActivity.scheduleTime) return null

  const currentActivityEndTimeMoment = getEarliestDate(
    moment(currentWorkshopActivity.completedAt),
    moment(currentWorkshopActivity.scheduleTime).add(currentWorkshopActivity.workshopActivityDuration, 'minutes'),
  )
  const nextActivityStartTimeMoment = moment(nextWorkshopActivity.scheduleTime)
  if (nextActivityStartTimeMoment.diff(currentActivityEndTimeMoment, 'minutes') >= MINIMUM_BREAK_DURATION) {
    return ({
      startTime: currentActivityEndTimeMoment.clone(),
      endTime: nextActivityStartTimeMoment.clone(),
      inProgress: currentTime.isBetween(currentActivityEndTimeMoment, nextActivityStartTimeMoment),
    })
  }

  return null
}
