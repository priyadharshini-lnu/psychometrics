import {
  useEffect, useState, useRef, useImperativeHandle, forwardRef,
} from 'react'
import { motion, useReducedMotion } from 'motion/react'
import cs from 'classnames'
import { v4 as uuid } from 'uuid'
import { DirectionalArrowIcon } from '~/glint/components/DirectionAwareIcon'
import styles from './styles.less'

type CountdownButtonProps = {
  disabled?: boolean
  className?: string
  handleContinue: () => void
  label: string
}

export type CountdownButtonRef = {
  reset: () => void
}

const MIN_COUNTDOWN = 5

export const CountdownButton = forwardRef<CountdownButtonRef, CountdownButtonProps>(({
  label, disabled = false, className, handleContinue,
}: CountdownButtonProps, ref) => {
  const [countdown, setCountdown] = useState<number>(MIN_COUNTDOWN)
  const [key, setKey] = useState<string>(uuid())
  const prefersReducedMotion = useReducedMotion()

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (disabled) return

    timerRef.current = setInterval(() => {
      if (countdown === 1) {
        handleContinue()
      } else {
        setCountdown(prev => prev - 1)
      }
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [countdown, disabled])

  useImperativeHandle(ref, () => ({
    reset: () => {
      setCountdown(MIN_COUNTDOWN)
      setKey(uuid())
    },
  }))

  return (
    <motion.button
      key={key}
      onClick={handleContinue}
      className={cs('flex', 'items-center',
        styles['countdown-button'], { [styles['countdown-button-disabled']]: disabled }, className)}
      disabled={disabled}
    >
      {!disabled && (
        <motion.div
          className={styles['countdown-button-overlay']}
          animate={{
            width: '100%',
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 5,
            repeatType: 'loop',
            ease: 'linear',
          }}
        />
      )}
      <span>{disabled ? `${label}` : `${label} (${countdown})` }</span>
      <DirectionalArrowIcon aria-label="" />
    </motion.button>
  )
})
