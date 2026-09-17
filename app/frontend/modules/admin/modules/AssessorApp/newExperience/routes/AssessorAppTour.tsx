import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { Button, Tour } from '@thetalententerprise/glint'
import type { TourStepProps } from '@thetalententerprise/glint'
import { QuestionCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { UserPreference } from '~/components/AdminShell/core'
import { useCurrentUserDetails } from '~/components/AdminShell/AdminTheme'
import { findPreference } from '~/components/AdminShell/currentUserDetails'
import { useResources } from '~/hooks/useResources'
import { TOUR_CATEGORY } from '../../context/consts'
import styles from './AssessorAppTour.less'


const { I18n } = window

type TourRegistration = {
  configKey: string
  ready: boolean
  steps: TourStepProps[]
}

type AssessorAppTourContextValue = {
  registerTour: (registration: TourRegistration) => void
  unregisterTour: (configKey: string) => void
}

const AssessorAppTourContext = createContext<AssessorAppTourContextValue>({
  registerTour: () => {},
  unregisterTour: () => {},
})

export const useAssessorAppTour = () => useContext(AssessorAppTourContext)

const AssessorAppTourProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const details = useCurrentUserDetails()
  const { createResource } = useResources<UserPreference>('user_preferences')
  const [tour, setTour] = useState<TourRegistration | null>(null)
  const [open, setOpen] = useState(false)
  const [seenConfigKeys, setSeenConfigKeys] = useState<string[]>([])

  const hasSeenTour = useCallback((configKey: string) => (
    seenConfigKeys.includes(configKey)
      || findPreference(details?.preferences ?? [], TOUR_CATEGORY, configKey)?.seen === true
  ), [details?.preferences, seenConfigKeys])

  const markSeen = useCallback((configKey: string) => {
    setSeenConfigKeys(current => (current.includes(configKey) ? current : [...current, configKey]))
    createResource({
      category: TOUR_CATEGORY,
      config_key: configKey,
      payload: { seen: true },
    }).catch(() => {})
  }, [createResource])

  const registerTour = useCallback((registration: TourRegistration) => {
    setTour(registration)
  }, [])

  const unregisterTour = useCallback((configKey: string) => {
    setTour(current => (current?.configKey === configKey ? null : current))
  }, [])

  const closeTour = useCallback(() => {
    if (tour) markSeen(tour.configKey)
    setOpen(false)
  }, [markSeen, tour])

  useEffect(() => {
    if (tour?.ready && !hasSeenTour(tour.configKey)) setOpen(true)
  }, [hasSeenTour, tour])

  const value = useMemo(() => ({ registerTour, unregisterTour }), [registerTour, unregisterTour])

  return (
    <AssessorAppTourContext.Provider value={value}>
      {children}
      {tour?.ready && (
        <Button
          type="primary"
          icon={<QuestionCircleOutlined />}
          className={styles.tourButton}
          onClick={() => setOpen(true)}
        >
          {I18n.t('admin.assessor_tour_button')}
        </Button>
      )}
      {tour && (
        <Tour
          open={open}
          steps={tour.steps}
          onClose={closeTour}
        />
      )}
    </AssessorAppTourContext.Provider>
  )
}

export { AssessorAppTourProvider }
