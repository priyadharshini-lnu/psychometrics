import { motion, useReducedMotion } from 'motion/react'

export const LighthouseIcon = () => {
  const primaryColor = 'var(--ant-primary-color)'
  const lighterColor = 'var(--ant-primary-3)'
  const prefersReducedMotion = useReducedMotion()
  return (
    <svg width="144" height="144" viewBox="0 0 120 120" fill="none">
      {/* Lighthouse base */}
      <motion.path
        d="M 50 85 L 45 95 L 75 95 L 70 85 Z"
        fill={primaryColor}
        opacity="0.5"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
        style={{ transformOrigin: 'bottom' }}
      />
      {/* Lighthouse body */}
      <motion.path
        d="M 52 40 L 50 85 L 70 85 L 68 40 Z"
        fill={lighterColor}
        opacity="0.4"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
        style={{ transformOrigin: 'bottom' }}
      />
      {/* Lighthouse top */}
      <motion.rect
        x="48"
        y="32"
        width="24"
        height="8"
        rx="1"
        fill={primaryColor}
        opacity="0.6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.5 }}
        style={{ transformOrigin: 'center' }}
      />
      {/* Light beams with continuous animation */}
      <motion.path
        d="M 60 30 L 40 20 L 45 25 Z"
        fill={lighterColor}
        opacity="0.3"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '60px 30px' }}
      />
      <motion.path
        d="M 60 30 L 80 20 L 75 25 Z"
        fill={lighterColor}
        opacity="0.3"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5,
        }}
        style={{ transformOrigin: '60px 30px' }}
      />
      {/* Animated waves */}
      {[0, 1, 2].map(i => (
        <motion.path
          key={i}
          // eslint-disable-next-line max-len
          d={`M ${30 + i * 5} ${95 + i * 3} Q ${45 + i * 5} ${92 + i * 3} ${60 + i * 5} ${95 + i * 3} T ${90 + i * 5} ${95 + i * 3}`}
          stroke={lighterColor}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
          animate={{
            x: [-10, 10, -10],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Sparkles */}
      <motion.g
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M 35 35 L 37 37 L 35 39 L 33 37 Z" fill={lighterColor} />
        <path d="M 85 45 L 87 47 L 85 49 L 83 47 Z" fill={lighterColor} />
        <path d="M 60 18 L 61 19 L 60 20 L 59 19 Z" fill={lighterColor} />
      </motion.g>
    </svg>
  )
}
