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
  shouldAnnounceRemainingTime?: boolean
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

const { I18n } = window


const announcements = {
  300: I18n.t('assessments.screen_reader_announcements.five_minutes_left'),
  60: I18n.t('assessments.screen_reader_announcements.one_minute_left'),
  30: I18n.t('assessments.screen_reader_announcements.thirty_seconds_left'),
  15: I18n.t('assessments.screen_reader_announcements.fifteen_seconds_left'),
  0: I18n.t('assessments.screen_reader_announcements.time_is_up'),
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
  shouldAnnounceRemainingTime = false,
  notificationPoints = [],
  notificationTemplate,
  notificationDuration = 15,
  className,
  ...rest
}) => {
  const [countDownValue, setCountDownValue] = useState<number | undefined>(undefined)
  const [timerFormat, setTimerFormat] = useState(seconds ? getFormat(seconds) : undefined)
  const [announcement, setAnnouncement] = useState<string>('')


  useEffect(() => {
    if (!seconds) return
    const countDownValue = Date.now() + seconds * 1000

    setCountDownValue(countDownValue)
    setTimerFormat(getFormat(seconds))
  }, [seconds])

  useEffect(() => {
    if (!seconds) return

    const notifications = notificationPoints.map(
      notificationPoint => notificationSetTimeout(notificationPoint.timeRemaining,
        seconds,
        notificationPoint.type),
    )

    return () => {
      notifications.forEach(notification => clearTimeout(notification))
    }
  }, [seconds, notificationPoints])

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


  useEffect(() => {
    if (!seconds || !countDownValue || !shouldAnnounceRemainingTime) return

    const interval = setInterval(() => {
      const currentRemainingTime = Math.floor((countDownValue - Date.now()) / 1000)

      if (shouldAnnounceRemainingTime) {
        if (currentRemainingTime in announcements) {
          setAnnouncement(announcements[currentRemainingTime])
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [countDownValue, seconds, shouldAnnounceRemainingTime])

  if (seconds === null) {
    return null
  }
  return (
    <>
      <span role="alert" aria-live="assertive" className="sr-only">{announcement}</span>
      <Statistic.Countdown
        className={cs(styles.timer, className)}
        value={countDownValue}
        onFinish={() => onFinish && onFinish()}
        format={timerFormat}
        onChange={handleTimerChange}
        {...rest}
      />
    </>
  )
}
