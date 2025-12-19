import { motion, useReducedMotion } from 'motion/react'
import { Cursor } from './Cursor'

export const MilestonesIcon = () => {
  const primaryColor = 'var(--ant-primary-color)'
  const lighterColor = 'var(--ant-primary-3)'
  const prefersReducedMotion = useReducedMotion()
  return (
    <svg width="144" height="144" viewBox="0 0 120 120" fill="none">
      {/* Document frame */}
      <motion.rect
        x="25"
        y="20"
        width="60"
        height="70"
        rx="2"
        stroke={primaryColor}
        strokeWidth="3"
        fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
      />
      {/* Timeline dots with pulse */}
      {[0, 1, 2].map(i => (
        <motion.g key={i}>
          <motion.circle
            cx="40"
            cy={35 + i * 18}
            r="4"
            fill={primaryColor}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={prefersReducedMotion ? { duration: 0 } : {
              scale: { duration: 0.2, delay: 0.15 + i * 0.1 },
              repeat: Infinity,
              repeatDelay: 2,
              delay: 0.15 + i * 0.1,
            }}
          />
          <motion.rect
            x="50"
            y={33 + i * 18}
            width="25"
            height="4"
            rx="2"
            fill={lighterColor}
            opacity="0.5"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.2 + i * 0.1 }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.g>
      ))}
      {/* Connecting line */}
      <motion.line
        x1="40"
        y1="35"
        x2="40"
        y2="71"
        stroke={lighterColor}
        strokeWidth="2"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.15 }}
      />
      {/* Progress indicator moving along timeline */}
      <motion.circle
        cx="40"
        cy="35"
        r="6"
        fill="none"
        stroke={primaryColor}
        strokeWidth="2"
        animate={{ cy: [35, 53, 71, 35] }}
        transition={prefersReducedMotion ? { duration: 0 }
          : { duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      {/* Cursor */}
      <Cursor x={70} y={70} />
    </svg>
  )
}
