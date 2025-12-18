import { motion, useReducedMotion } from 'motion/react'
import { Cursor } from './Cursor'

export const BuildingBlocksIcon = () => {
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
      {/* Header block */}
      <motion.rect
        x="35"
        y="30"
        width="40"
        height="8"
        rx="2"
        fill={lighterColor}
        opacity="0.6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
        style={{ transformOrigin: 'left' }}
      />
      {/* Grid blocks with continuous pulse */}
      {[0, 1, 2].map(row => [0, 1, 2].map(col => (
        <motion.rect
          key={`${row}-${col}`}
          x={35 + col * 15}
          y={45 + row * 12}
          width="12"
          height="8"
          rx="1"
          fill={primaryColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            scale: { duration: 0.2, delay: 0.2 + (row * 3 + col) * 0.05 },
            opacity: {
              duration: 1.5, repeat: Infinity, delay: (row * 3 + col) * 0.15, ease: 'easeInOut',
            },
          }}
        />
      )))}
      {/* Sparkles with faster animation */}
      <motion.g
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M 92 60 L 94 62 L 92 64 L 90 62 Z" fill={lighterColor} />
        <path d="M 88 52 L 89 53 L 88 54 L 87 53 Z" fill={lighterColor} />
        <path d="M 95 68 L 96 69 L 95 70 L 94 69 Z" fill={lighterColor} />
      </motion.g>

      <Cursor x={70} y={55} />
    </svg>
  )
}
