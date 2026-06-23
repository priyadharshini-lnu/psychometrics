import {
  FC, useEffect, useMemo, useRef, useState,
} from 'react'
import { Statistic, notification as antdNotification, StatisticProps } from 'antd'
import cs from 'classnames'
import { SafeTimer } from '../SafeTimer'
import styles from './styles.less'

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
  notificationTemplate?: (minutes: number, seconds: number) => string
  safeTimer?: boolean
}

const SECONDS_PER_DAY = 60 * 60 * 24
const SECONDS_PER_HOUR = 60 * 60
const SECONDS_PER_MINUTE = 60
const NOTIFICATION_CHECK_INTERVAL_MS = 10000

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
  notificationPoints,
  notificationTemplate,
  notificationDuration = 15,
  className,
  safeTimer,
  ...rest
}) => {
  const [countDownValue, setCountDownValue] = useState<number | undefined>(undefined)
  const [timerFormat, setTimerFormat] = useState(seconds ? getFormat(seconds) : undefined)
  const [announcement, setAnnouncement] = useState<string>('')
  const stableNotificationPoints = useMemo(
    () => notificationPoints || [],
    [notificationPoints],
  )
  const firedNotificationsRef = useRef(new Set<number>())


  useEffect(() => {
    if (!seconds) return
    const countDownValue = Date.now() + seconds * 1000
    firedNotificationsRef.current = new Set<number>()

    setCountDownValue(countDownValue)
    setTimerFormat(getFormat(seconds))
  }, [seconds])

  useEffect(() => {
    if (!seconds || !countDownValue || !stableNotificationPoints.length) return

    const firedSet = firedNotificationsRef.current
    let isInitialCheck = true

    const checkNotifications = () => {
      const remainingSeconds = Math.max(0, Math.floor((countDownValue - Date.now()) / 1000))

      const pendingNotifications = stableNotificationPoints.filter(
        ({ timeRemaining }) => !firedSet.has(timeRemaining) && remainingSeconds <= timeRemaining,
      )

      const activeNotificationPoint = pendingNotifications.length
        ? Math.min(...pendingNotifications.map(({ timeRemaining }) => timeRemaining))
        : null

      stableNotificationPoints.forEach(({ timeRemaining, type }) => {
        if (firedSet.has(timeRemaining)) return
        if (remainingSeconds > timeRemaining) return

        firedSet.add(timeRemaining)

        if (timeRemaining !== activeNotificationPoint) return

        const displayMinutes = isInitialCheck
          ? Math.floor(remainingSeconds / 60)
          : Math.floor(timeRemaining / 60)
        const displaySeconds = isInitialCheck
          ? remainingSeconds % 60
          : 0

        antdNotification[type]({
          message: notificationTemplate && notificationTemplate(displayMinutes, displaySeconds),
          duration: notificationDuration,
        })
      })

      isInitialCheck = false
    }

    checkNotifications()
    const intervalId = setInterval(checkNotifications, NOTIFICATION_CHECK_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [
    seconds,
    countDownValue,
    stableNotificationPoints,
    notificationTemplate,
    notificationDuration,
  ])

  const handleTimerChange = (value?: string | number) => {
    if (typeof value !== 'number') return
    const newFormat = getFormat(value / 1000)
    newFormat !== timerFormat && setTimerFormat(newFormat)
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
      {safeTimer ? (
        <SafeTimer
          className={cs(styles.timer, className)}
          remainingTime={seconds || 0}
          onFinish={() => onFinish && onFinish()}
          format={timerFormat}
          onChange={handleTimerChange}
          {...rest}
        />
      ) : (
        <Statistic.Countdown
          className={cs(styles.timer, className)}
          value={countDownValue}
          onFinish={() => onFinish && onFinish()}
          format={timerFormat}
          onChange={handleTimerChange}
          {...rest}
        />
      )}
    </>
  )
}
