import { motion, useReducedMotion } from 'motion/react'
import { Cursor } from './Cursor'

export const AnalyzingIcon = () => {
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      />
      {/* Lines inside document */}
      <motion.rect
        x="35"
        y="35"
        width="30"
        height="4"
        rx="2"
        fill={lighterColor}
        opacity="0.5"
        initial={{ width: 0 }}
        animate={{ width: 30 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
      />
      <motion.rect
        x="35"
        y="45"
        width="40"
        height="4"
        rx="2"
        fill={lighterColor}
        opacity="0.5"
        initial={{ width: 0 }}
        animate={{ width: 40 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
      />
      {/* Chart visual */}
      <motion.path
        d="M 35 65 L 45 55 L 55 60 L 65 50 L 75 55"
        stroke={primaryColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
      />
      {/* Animated chart bars */}
      {[0, 1, 2, 3].map(i => (
        <motion.rect
          key={i}
          x={38 + i * 10}
          y={65}
          width="6"
          height="0"
          fill={primaryColor}
          opacity="0.6"
          animate={{ height: [0, 8 + Math.random() * 8, 4 + Math.random() * 8] }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'bottom' }}
        />
      ))}
      {/* Cursor with continuous movement */}
      <Cursor x={70} y={70} />
    </svg>
  )
}
