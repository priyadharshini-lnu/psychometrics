import {
  FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { GlintThemeContext } from '@thetalententerprise/glint'
import type { GlintMode } from '@thetalententerprise/glint'
import { THEME_CATEGORY, THEME_CONFIG_KEY, useThemePreference } from './useThemePreference'
import { currentUserFromInitialState, findPreference } from './currentUserDetails'
import type { CurrentUserDetails } from './currentUserDetails'
import {
  DARK_THEMES,
  DEFAULT_DARK,
  DEFAULT_LIGHT,
  GlintAdminTheme,
  LIGHT_THEMES,
  THEME_SWITCHER_ENABLED,
  applyStaticTheme,
  choiceFrom,
} from './GlintAdminTheme'
import type { ThemeChoice } from './GlintAdminTheme'

export {
  LIGHT_THEMES, DARK_THEMES, THEME_LABELS, DEFAULT_LIGHT, DEFAULT_DARK, THEME_SWITCHER_ENABLED,
} from './GlintAdminTheme'
export type { ThemeChoice } from './GlintAdminTheme'

const MODES: GlintMode[] = ['system', 'light', 'dark']

type ThemeContextValue = ThemeChoice & {
  setMode: (mode: GlintMode) => void
  setLight: (key: string) => void
  setDark: (key: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  light: DEFAULT_LIGHT,
  dark: DEFAULT_DARK,
  setMode: () => {},
  setLight: () => {},
  setDark: () => {},
})

export const useAdminTheme = () => useContext(ThemeContext)

const SessionContext = createContext<CurrentUserDetails | null>(null)

/** The server-seeded session details every consumer below the shell reads. */
export const useCurrentUserDetails = () => useContext(SessionContext)

// Feeds the active theme to antd's detached statics; reads the resolved appearance, so 'system' follows the OS.
const StaticThemeBridge = () => {
  const { light, dark, mode } = useContext(GlintThemeContext)
  const active = mode === 'dark' ? dark : light

  useEffect(() => { applyStaticTheme(active) }, [active])

  return null
}

const ThemedShell: FC<{ initialChoice: ThemeChoice, children: ReactNode }> = ({ initialChoice, children }) => {
  const [choice, setChoice] = useState<ThemeChoice>(initialChoice)
  const { persist } = useThemePreference()

  const apply = useCallback((patch: Partial<ThemeChoice>) => {
    if (!THEME_SWITCHER_ENABLED) return
    setChoice((current) => {
      const next = { ...current, ...patch }
      persist({ mode: next.mode, light: next.light, dark: next.dark })
      return next
    })
  }, [persist])

  const value = useMemo<ThemeContextValue>(() => ({
    ...choice,
    setMode: (mode) => { if (MODES.includes(mode)) apply({ mode }) },
    setLight: (light) => { if (light in LIGHT_THEMES) apply({ light }) },
    setDark: (dark) => { if (dark in DARK_THEMES) apply({ dark }) },
  }), [choice, apply])

  return (
    <ThemeContext.Provider value={value}>
      <GlintAdminTheme choice={choice}>
        <StaticThemeBridge />
        {children}
      </GlintAdminTheme>
    </ThemeContext.Provider>
  )
}

export const AdminTheme: FC<{ children: ReactNode }> = ({ children }) => {
  const details = useMemo(currentUserFromInitialState, [])

  // The stored theme ships with the page, so the first paint is already themed and the splash can go at once.
  useEffect(() => { document.getElementById('admin-splash')?.remove() }, [])

  const storedTheme = findPreference(details?.preferences ?? [], THEME_CATEGORY, THEME_CONFIG_KEY)

  return (
    <SessionContext.Provider value={details}>
      <ThemedShell initialChoice={choiceFrom(storedTheme)}>
        {children}
      </ThemedShell>
    </SessionContext.Provider>
  )
}

export default AdminTheme
