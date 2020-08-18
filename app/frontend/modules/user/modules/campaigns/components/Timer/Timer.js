import React, { useEffect, useState } from 'react'
import { Statistic, notification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import styles from './Timer.scss'

const { Countdown } = Statistic

const NOTIFICATION_POINTS = [50, 75, 90]
const TIMER_STATES = {
  75: styles.warning,
  90: styles.danger,
}

const Timer = ({ preview, preview: { expiryDate, timerDuration }, saveResults }) => {
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
  const [timerState, setTimerState] = useState(styles.green)

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
          message: I18n.t('threesixty.timer.notification', { minutes, seconds }),
          duration: 15,
          className,
        })
      }, remainingTime - notificationRemainingTime)
    }
  }
  const style = {
    backgroundColor: timerState,
  }
  return (
    expiryDate ? (
      <Countdown
        value={new Date(expiryDate)}
        onFinish={() => saveResults(preview)}
        prefix={<ClockCircleOutlined className="mrs" />}
        className={styles.timer}
        style={style}
      />
    ) : null
  )
}

export default Timer
