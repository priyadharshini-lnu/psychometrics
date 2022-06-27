import React, { FC, useEffect, useState } from 'react'
import { Statistic, notification as antdNotification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import cs from 'classnames'

import styles from './styles.less'

const { I18n, setTimeout, clearTimeout } = window

const NOTIFICATION_POINTS = [50, 75, 90]
const TIMER_STATES = {
  75: 'warning',
  90: 'danger',
}

interface TimerProps {
  seconds: number | null
  onFinish(): void
  notification?: boolean
  background?: string
  theme?: string
}

export const Timer: FC<TimerProps> = ({
  seconds,
  onFinish,
  notification = false,
  background = 'green',
  theme = 'withBackground',
}) => {
  const [countDownValue, setCountDownValue] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!seconds) return
    setCountDownValue(Date.now() + (seconds * 1000))

    const notifications = NOTIFICATION_POINTS.map((notificationPoint) => {
      const className = styles[`notification${notificationPoint}`]
      return notificationSetTimeout(notificationPoint, seconds, className)
    })

    return () => {
      notifications.forEach(notification => clearTimeout(notification))
    }
  }, [seconds])

  const [timerState, setTimerState] = useState(background)

  const notificationSetTimeout = (notificationPoint: number, seconds: number, className: string) => {
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

    return undefined
  }

  const bgClass = seconds && seconds < 1 ? styles.danger : styles[timerState]
  const timerStyle = theme === 'withBackground' ? styles.withBg : styles.plain

  if (seconds === null) {
    return null
  }

  return (
    <Statistic.Countdown
      value={countDownValue}
      onFinish={() => onFinish()}
      prefix={theme === 'withBackground' && <ClockCircleOutlined className="me-2" />}
      className={cs(styles.timer, timerStyle, bgClass)}
    />
  )
}

interface StaticTimeProps extends Pick<TimerProps, 'theme'> {
  expiryDate: moment.Moment | null
}

export const StaticTime: FC<StaticTimeProps> = ({
  expiryDate,
  theme = 'withBackground',
}) => {
  if (expiryDate === null) {
    return null
  }

  const expiryDateInFormat = moment(expiryDate).format('L LT')

  const timerStyle = theme === 'withBackground' ? styles.withBg : styles.plain

  return (
    <Statistic
      value={`${expiryDateInFormat}`}
      prefix={
        theme === 'withBackground' && <ClockCircleOutlined className="me-2" />
      }
      className={cs(styles.timer, timerStyle)}
    />
  )
}
