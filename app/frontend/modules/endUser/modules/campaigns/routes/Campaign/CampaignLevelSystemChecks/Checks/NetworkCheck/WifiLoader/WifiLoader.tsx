import { motion, useReducedMotion } from 'motion/react'
import {
  WifiOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

export const WifiLoader = () => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div>
      <div
        className="flex justify-center item-center pos-rel"
        style={{
          width: '200px',
          height: '200px',
        }}
      >
        {[0, 1, 2].map(index => (
          <motion.div
            key={index}
            className={styles['wifi-icon-parent']}
            animate={{
              scale: [0, 0.5, 1],
              opacity: [0.3, 0.6, 0],
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 2,
              repeat: Infinity,
              repeatType: 'loop',
              delay: index * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Center wifi icon */}
        <motion.div
          className={styles['wifi-icon']}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        >
          <WifiOutlined style={{ fontSize: '2rem' }} />
        </motion.div>
      </div>
    </div>
  )
}
