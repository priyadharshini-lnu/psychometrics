import React, { useEffect, useState } from 'react'
import { Statistic, notification as antdNotification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import cs from 'classnames'
import styles from './Timer.scss'

const { Countdown } = Statistic

const NOTIFICATION_POINTS = [50, 75, 90]
const TIMER_STATES = {
  75: 'warning',
  90: 'danger',
}

const Timer = ({
  seconds,
  onFinish,
  notification,
  background = 'green',
  theme = 'withBackground',
}) => {
  useEffect(() => {
    if (!seconds) return
    setCountDownValue(Date.now() + (seconds * 1000))

    // eslint-disable-next-line arrow-body-style
    const notifications = NOTIFICATION_POINTS.map((notificationPoint) => {
      const className = styles[`notification${notificationPoint}`]
      return notificationSetTimeout(notificationPoint, seconds, className)
    })

    return () => {
      notifications.map(notification => clearTimeout(notification))
    }
  }, [seconds])

  const [timerState, setTimerState] = useState(background)
  const [countDownValue, setCountDownValue] = useState(null)

  const notificationSetTimeout = (notificationPoint, seconds, className) => {
    const remainingTimeInMilliseconds = seconds * 1000
    const notificationRemainingTime = seconds * 1000 * (100 - notificationPoint) / 100

    if (remainingTimeInMilliseconds - notificationRemainingTime > 0) {
      const minutes = Math.floor(notificationRemainingTime / 60000)
      const seconds = Math.floor((notificationRemainingTime - minutes * 60000) / 1000)

      return setTimeout(() => {
        if (TIMER_STATES[notificationPoint]) {
          setTimerState(TIMER_STATES[notificationPoint])
        }
        if (notification) {
          antdNotification.warning({
            message: I18n.t('campaign.timer.notification', { minutes, seconds }),
            duration: 15,
            className,
          })
        }
      }, remainingTimeInMilliseconds - notificationRemainingTime)
    }
  }

  const bgClass = seconds < 1 ? styles.danger : styles[timerState]
  const timerStyle = theme === 'withBackground' ? styles.withBg : styles.plain

  return (
    seconds !== null ? (
      <Countdown
        value={countDownValue}
        onFinish={onFinish}
        prefix={theme === 'withBackground' && <ClockCircleOutlined className="mrs" />}
        className={cs(styles.timer, timerStyle, bgClass)}
      />
    ) : null
  )
}

export default Timer
