import React, { useEffect, useState } from 'react'
import { Statistic, notification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import styles from './Timer.scss'

const { Countdown } = Statistic

const NOTIFICATION_POINTS = [50, 75, 90]
const TIMER_STATES = {
  75: 'warning',
  90: 'danger',
}

const Timer = ({
  preview,
  preview: { expiryDate, timerDuration },
  onFinish,
  background = 'green',
  campaignTimeLeft,
}) => {
  useEffect(() => {
    if (!timerDuration) return
    const remainingTime = (new Date(expiryDate) - new Date())
    // eslint-disable-next-line arrow-body-style
    const notifications = NOTIFICATION_POINTS.map((notificationPoint) => {
      const className = styles[`notification${notificationPoint}`]
      return notificationSetTimeout(notificationPoint, remainingTime, timerDuration, className)
    })

    return () => {
      notifications.map(notification => clearTimeout(notification))
    }
  }, [timerDuration])
  const [timerState, setTimerState] = useState(background)

  const notificationSetTimeout = (notificationPoint, remainingTime, timerDuration, className) => {
    const notificationRemainingTime = timerDuration * 1000 * (100 - notificationPoint) / 100

    if (remainingTime - notificationRemainingTime > 0) {
      const minutes = Math.floor(notificationRemainingTime / 60000)
      const seconds = Math.floor((notificationRemainingTime - minutes * 60000) / 1000)

      return setTimeout(() => {
        if (TIMER_STATES[notificationPoint]) {
          setTimerState(TIMER_STATES[notificationPoint])
        }
        notification.warning({
          message: I18n.t('campaign.timer.notification', { minutes, seconds }),
          duration: 15,
          className,
        })
      }, remainingTime - notificationRemainingTime)
    }
  }

  const bgClass = styles[timerState]

  const campaignExpire = Date.now() + campaignTimeLeft * 60000
  const timeLeft = campaignTimeLeft !== null && campaignExpire < new Date(expiryDate) ? campaignExpire : expiryDate

  return (
    timeLeft ? (
      <Countdown
        value={new Date(timeLeft)}
        onFinish={() => onFinish(preview)}
        prefix={<ClockCircleOutlined className="mrs" />}
        className={[styles.timer, styles.withBg, bgClass]}
      />
    ) : null
  )
}

export default Timer
