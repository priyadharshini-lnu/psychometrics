import { FC, useEffect, useState } from 'react'
import { Statistic, notification as antdNotification, StatisticProps } from 'antd'
import cs from 'classnames'

import styles from './styles.less'

const { setTimeout, clearTimeout } = window

export type Notification = {
  timeRemaining: number
  type: 'info' | 'warning' | 'error'
}

type CountdownTimerProps = StatisticProps & {
  seconds: number | null
  onFinish?: () => void
  notificationPoints?: Notification[]
  notificationDuration?: number
  notificationTemplate?: (minutes: number) => string
}

const SECONDS_PER_DAY = 60 * 60 * 24
const SECONDS_PER_HOUR = 60 * 60
const SECONDS_PER_MINUTE = 60

const formatData = {
  minute: { format: 'm[m] s[s]', units: SECONDS_PER_MINUTE },
  hour: { format: 'H[h] m[m] s[s]', units: SECONDS_PER_HOUR },
  day: { format: 'D[d] H[h] m[m] s[s]', units: SECONDS_PER_DAY },
}

const getFormat = (seconds: number) => {
  if (Math.floor(seconds / SECONDS_PER_DAY) > 0) {
    return formatData.day.format
  }
  if (Math.floor(seconds / SECONDS_PER_HOUR) > 0) {
    return formatData.hour.format
  }
  if (Math.floor(seconds / SECONDS_PER_MINUTE) > 0) {
    return formatData.minute.format
  }
  return 'ss[s]'
}

export const CountdownTimer: FC<CountdownTimerProps> = ({
  seconds,
  onFinish,
  notificationPoints = [],
  notificationTemplate,
  notificationDuration = 15,
  className,
  ...rest
}) => {
  const [countDownValue, setCountDownValue] = useState<number | undefined>(undefined)
  const [timerFormat, setTimerFormat] = useState(seconds ? getFormat(seconds) : undefined)

  useEffect(() => {
    if (!seconds) return
    setCountDownValue(Date.now() + seconds * 1000)
    setTimerFormat(getFormat(seconds))

    const notifications = notificationPoints.map(notificationPoint => notificationSetTimeout(
      notificationPoint.timeRemaining, seconds, notificationPoint.type,
    ))

    return () => {
      notifications.forEach(notification => clearTimeout(notification))
    }
  }, [seconds])

  const handleTimerChange = (value: number) => {
    const newFormat = getFormat(value / 1000)
    newFormat !== timerFormat && setTimerFormat(newFormat)
  }

  const notificationSetTimeout = (
    timeRemaining: number,
    totalSeconds: number,
    type: Notification['type'],
  ) => {
    const remainingTimeInMilliseconds = totalSeconds * 1000
    const notificationTimeInMilliseconds = timeRemaining * 1000

    if (remainingTimeInMilliseconds - notificationTimeInMilliseconds > 0) {
      const minutes = Math.floor(timeRemaining / 60)
      return setTimeout(() => {
        if (notificationPoints.length) {
          antdNotification[type]({
            message: notificationTemplate && notificationTemplate(minutes),
            duration: notificationDuration,
          })
        }
      }, remainingTimeInMilliseconds - notificationTimeInMilliseconds)
    }

    return undefined
  }

  if (seconds === null) {
    return null
  }

  return (
    <Statistic.Countdown
      className={cs(styles.timer, className)}
      value={countDownValue}
      onFinish={() => onFinish && onFinish()}
      format={timerFormat}
      onChange={handleTimerChange}
      {...rest}
    />
  )
}
