import React, { useEffect } from 'react'
import { Statistic, notification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import styles from './Timer.scss'

const { Countdown } = Statistic

const NOTIFICATION_POINTS = [50, 75, 90]

const Timer = ({ preview, preview: { expiryDate, timerDuration }, saveResults }) => {
  useEffect(() => {
    if (!timerDuration) return
    const remainingTime = (new Date(expiryDate) - new Date())

    // eslint-disable-next-line arrow-body-style
    const notifications = NOTIFICATION_POINTS.map((notificationPoint) => {
      return notificationSetTimeout(notificationPoint, remainingTime, timerDuration)
    })

    return () => {
      notifications.map(notification => clearTimeout(notification))
    }
  }, [timerDuration])

  const notificationSetTimeout = (notificationPoint, remainingTime, timerDuration) => {
    const notificationRemainingTime = timerDuration * 1000 * (100 - notificationPoint) / 100

    if (remainingTime - notificationRemainingTime > 0) {
      const minutes = Math.floor(notificationRemainingTime / 60000)
      const seconds = Math.floor((notificationRemainingTime - minutes * 60000) / 1000)

      return setTimeout(() => {
        notification.warning({ message: I18n.t('threesixty.timer.notification', { minutes, seconds }) })
      }, remainingTime - notificationRemainingTime)
    }
  }

  return (
    expiryDate ? (
      <Countdown
        value={new Date(expiryDate)}
        onFinish={() => saveResults(preview)}
        prefix={<ClockCircleOutlined className="mrs" />}
        className={styles.timer}
      />
    ) : null
  )
}

export default Timer
