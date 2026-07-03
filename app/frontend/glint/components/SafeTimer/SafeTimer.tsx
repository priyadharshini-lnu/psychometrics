import {
  FC, useEffect, useRef, useState,
} from 'react'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import styles from './styles.less'

type SafeTimerProps = {
  remainingTime: number | null
  format?: string
  className?: string
  onChange?: (remainingMs: number) => void
  onFinish: () => void
  onTimeShiftDetected?: () => void
  prefix?: React.ReactNode
}

// Any wall-clock delta larger than this is treated as a system time correction
// rather than real elapsed time, and is ignored by the countdown.
const TIME_SHIFT_THRESHOLD_MS = 60_000

export const SafeTimer: FC<SafeTimerProps> = ({
  remainingTime,
  format,
  className,
  onChange,
  onFinish,
  onTimeShiftDetected,
  ...rest
}) => {
  const remainingMsRef = useRef<number>(Math.max(0, (remainingTime ?? 0) * 1000))
  const prevWallClockRef = useRef<number>(Date.now())
  const finishedRef = useRef<boolean>(false)
  const [displayMs, setDisplayMs] = useState<number>(remainingMsRef.current)

  const onFinishRef = useRef(onFinish)
  const onChangeRef = useRef(onChange)
  const onTimeShiftDetectedRef = useRef(onTimeShiftDetected)
  onFinishRef.current = onFinish
  onChangeRef.current = onChange
  onTimeShiftDetectedRef.current = onTimeShiftDetected

  useEffect(() => {
    if (remainingTime === null) return
    remainingMsRef.current = Math.max(0, remainingTime * 1000)
    prevWallClockRef.current = Date.now()
    finishedRef.current = false
    setDisplayMs(remainingMsRef.current)
  }, [remainingTime])

  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return

    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const now = Date.now()
      const deltaMs = now - prevWallClockRef.current

      if (Math.abs(deltaMs) > TIME_SHIFT_THRESHOLD_MS) {
        // System clock jumped forward — ignore the delta and rebase.
        prevWallClockRef.current = now
        onTimeShiftDetectedRef.current?.()
        timeoutId = setTimeout(tick, 1000)
        return
      }

      remainingMsRef.current = Math.max(0, remainingMsRef.current - deltaMs)
      prevWallClockRef.current = now

      setDisplayMs(remainingMsRef.current)
      onChangeRef.current?.(remainingMsRef.current)

      if (remainingMsRef.current <= 0 && !finishedRef.current) {
        finishedRef.current = true
        onFinishRef.current()
        return
      }

      timeoutId = setTimeout(tick, Math.max(0, 2000 - deltaMs))
    }

    timeoutId = setTimeout(tick, 1000)
    return () => clearTimeout(timeoutId)
  }, [remainingTime])

  if (remainingTime === null) return null

  return (
    <div className={cs(className)}>
      {rest?.prefix && <span className={styles.prefix}>{rest.prefix}</span>}
      <span className={styles.timer}>
        {dayjs.duration(displayMs).format(format || 'HH:mm:ss')}
      </span>
    </div>
  )
}
