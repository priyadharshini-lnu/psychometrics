import { motion, useReducedMotion } from 'motion/react'
import { Cursor } from './Cursor'

export const FinalizingIcon = () => {
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
        transition={prefersReducedMotion
          ? { duration: 0 } : { duration: 0.2 }}
      />
      {/* Document lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <motion.rect
          key={i}
          x="35"
          y={32 + i * 10}
          width={i === 4 ? 20 : 40}
          height="3"
          rx="1.5"
          fill={lighterColor}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: 1,
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={prefersReducedMotion
            ? { duration: 0 } : {
              scaleX: { duration: 0.3, delay: 0.1 + i * 0.05 },
              opacity: {
                duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut',
              },
            }}
          style={{ transformOrigin: 'left' }}
        />
      ))}
      {/* Checkmark with continuous pulse */}
      <motion.path
        d="M 60 50 L 65 55 L 75 42"
        stroke={primaryColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          opacity: [1, 0.6, 1],
        }}
        transition={prefersReducedMotion
          ? { duration: 0 } : {
            pathLength: { duration: 0.4, delay: 0.4 },
            opacity: {
              duration: 1.5, repeat: Infinity, delay: 0.8, ease: 'easeInOut',
            },
          }}
      />
      {/* Pulsing circle around checkmark */}
      <motion.circle
        cx="67"
        cy="48"
        r="12"
        fill="none"
        stroke={lighterColor}
        strokeWidth="2"
        opacity="0.4"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={prefersReducedMotion
          ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Cursor with continuous movement */}
      <Cursor x={70} y={70} />
    </svg>
  )
}
