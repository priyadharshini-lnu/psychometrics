import { motion, useReducedMotion } from 'motion/react'
import { Cursor } from './Cursor'

export const PersonalizingIcon = () => {
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
      {/* Icon placeholders with continuous rotation/pulse */}
      <motion.circle
        cx="45"
        cy="40"
        r="8"
        fill={lighterColor}
        opacity="0.5"
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: 0,
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          scale: { duration: 0.3, delay: 0.15 },
          rotate: { duration: 0.4, delay: 0.15 },
          opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.rect
        x="38"
        y="55"
        width="14"
        height="14"
        rx="2"
        fill={lighterColor}
        opacity="0.5"
        initial={{ scale: 0, rotate: 180 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          scale: { duration: 0.3, delay: 0.25 },
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          opacity: {
            duration: 1.5, repeat: Infinity, delay: 0.3, ease: 'easeInOut',
          },
        }}
      />
      <motion.polygon
        points="65,35 72,35 68.5,42"
        fill={lighterColor}
        opacity="0.5"
        initial={{ scale: 0, rotate: -90 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: 0,
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          scale: { duration: 0.3, delay: 0.35 },
          rotate: { duration: 0.4, delay: 0.35 },
          opacity: {
            duration: 1.5, repeat: Infinity, delay: 0.6, ease: 'easeInOut',
          },
        }}
      />
      <Cursor x={70} y={70} />
      {/* Sparkles with faster animation */}
      <motion.g
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
        transition={prefersReducedMotion
          ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M 80 38 L 82 40 L 80 42 L 78 40 Z" fill={lighterColor} />
        <path d="M 75 30 L 76 31 L 75 32 L 74 31 Z" fill={lighterColor} />
      </motion.g>
    </svg>
  )
}
