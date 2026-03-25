import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { DirectionalArrowIcon } from '~/glint/components/DirectionAwareIcon'


type CountdownButtonProps = {
  disabled?: boolean
  className?: string
  handleContinue: () => void
  label: string
}

export const CountdownButton = ({
  label, disabled = false, className, handleContinue,
}: CountdownButtonProps) => {
  const [countdown, setCountdown] = useState<number>(5)

  useEffect(() => {
    if (disabled) return

    const timer = setInterval(() => {
      if (countdown === 1) {
        handleContinue()
      } else {
        setCountdown(prev => prev - 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, disabled])

  return (
    <motion.button
      onClick={handleContinue}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
        backgroundColor: 'var(--ant-primary-color)',
        color: 'white',
        border: 'none',
        paddingInline: '1rem',
        paddingInlineEnd: '1rem',
        borderRadius: '2px',
        height: '32px',
        ...(disabled ? {
          cursor: 'not-allowed',
          backgroundColor: 'var(--ant-disabled-bg)',
          color: 'rgba(0, 0, 0, 0.25)',
        } : {}),
      }}
      className={className}
      disabled={disabled}
    >
      {!disabled && (
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          animate={{
            width: '100%',
          }}
          transition={{
            duration: 5,
            ease: 'linear',
          }}
        />
      )}
      <span>{disabled ? `${label}` : `${label} (${countdown})` }</span>
      <DirectionalArrowIcon aria-label="" />
    </motion.button>
  )
}
