import { useCallback } from 'react'
import { useResources } from '~/hooks/useResources'
import { UserPreference } from './core'

export const THEME_CATEGORY = 'theme'
export const THEME_CONFIG_KEY = 'appearance'

type ThemePayload = {
  mode: string
  light: string
  dark: string
}

// Read side is the server-seeded initial state (no flash on first paint); creates upsert server-side.
export const useThemePreference = () => {
  const { createResource } = useResources<UserPreference>('user_preferences')

  // Fire-and-forget: the appearance already applied; a failed write must not revert it.
  const persist = useCallback((payload: ThemePayload) => {
    createResource({ category: THEME_CATEGORY, config_key: THEME_CONFIG_KEY, payload }).catch(() => {})
  }, [createResource])

  return { persist }
}
