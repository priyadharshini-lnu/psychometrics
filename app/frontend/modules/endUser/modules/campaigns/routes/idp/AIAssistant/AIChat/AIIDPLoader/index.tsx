import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Flex } from 'antd'
import { AnalyzingIcon } from './AnalyzingIcon'
import { BuildingBlocksIcon } from './BuildingBlocksIcon'
import { PersonalizingIcon } from './PersonalizingIcon'
import { LighthouseIcon } from './LighthouseIcon'
import { FinalizingIcon } from './FinalizingIcon'

interface LoadingStage {
  component: React.ReactNode;
  message: string;
  duration: number;
}

const { I18n } = window

const stages: LoadingStage[] = [
  {
    component: <AnalyzingIcon />,
    message: I18n.t('enduser.idp_loading_first_step'),
    duration: 8000,
  },
  {
    component: <BuildingBlocksIcon />,
    message: I18n.t('enduser.idp_loading_second_step'),
    duration: 8000,
  },
  {
    component: <PersonalizingIcon />,
    message: I18n.t('enduser.idp_loading_fourth_step'),
    duration: 8000,
  },
  {
    component: <FinalizingIcon />,
    message: I18n.t('enduser.idp_loading_fifth_step'),
    duration: 8000,
  },
  {
    component: <LighthouseIcon />,
    message: I18n.t('enduser.idp_loading_sixth_step'),
    duration: 8000,
  },
]

export const AIIDPLoader: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStage(prev => (prev + 1) % stages.length)
    }, stages[currentStage].duration)

    return () => clearTimeout(timer)
  }, [currentStage])

  return (
    <Flex className="fs-16" vertical align="center" justify="center" gap={0} style={{ height: '100%' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
        >
          {stages[currentStage].component}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          className="ta-c font-semi-bold"
        >
          {stages[currentStage].message}
        </motion.p>
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
        className="ta-c whitespace-nowrap"
        style={{ fontSize: 'calc(1em - 2px)', color: 'var(--grey-text)' }}
      >
        {I18n.t('enduser.idp_loading_secondary_text')}
      </motion.p>
    </Flex>
  )
}
