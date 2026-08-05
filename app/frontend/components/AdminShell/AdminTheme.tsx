import {
  FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { GlintThemeContext } from '@thetalententerprise/glint'
import type { GlintMode } from '@thetalententerprise/glint'
import { useSetCssVars } from '~/hooks/useSetCssVars'
import { THEME_CATEGORY, THEME_CONFIG_KEY, useThemePreference } from './useThemePreference'
import { fetchCurrentUserDetails, findPreference } from './currentUserDetails'
import type { CurrentUserDetails } from './currentUserDetails'
import {
  DARK_THEMES,
  DEFAULT_DARK,
  DEFAULT_LIGHT,
  DEFAULT_THEME_CHOICE,
  GlintAdminTheme,
  LIGHT_THEMES,
  applyStaticTheme,
} from './GlintAdminTheme'
import type { ThemeChoice } from './GlintAdminTheme'

export {
  LIGHT_THEMES, DARK_THEMES, THEME_LABELS, DEFAULT_LIGHT, DEFAULT_DARK,
} from './GlintAdminTheme'
export type { ThemeChoice } from './GlintAdminTheme'

const MODES: GlintMode[] = ['system', 'light', 'dark']

export const THEME_SWITCHER_ENABLED = window.PsyGlobalState?.features?.theme_switcher === true

const choiceFrom = (stored: Record<string, unknown> | null): ThemeChoice => {
  if (!THEME_SWITCHER_ENABLED) return DEFAULT_THEME_CHOICE
  return {
    mode: MODES.find(mode => mode === stored?.mode) ?? 'system',
    light: typeof stored?.light === 'string' && stored.light in LIGHT_THEMES ? stored.light : DEFAULT_LIGHT,
    dark: typeof stored?.dark === 'string' && stored.dark in DARK_THEMES ? stored.dark : DEFAULT_DARK,
  }
}

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

/** The gated session details — non-null for everything rendered inside AdminTheme. */
export const useCurrentUserDetails = () => useContext(SessionContext)

// Mirrors the active theme onto the legacy --ant-* vars; sits inside GlintThemeProvider, after the legacy writer.
const LegacyCssVarBridge = () => {
  useSetCssVars()
  return null
}

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
        {/* Ordering dependency: must write --ant-* after DefaultAntThemeWrapper's useSetCssVars. */}
        <LegacyCssVarBridge />
        <StaticThemeBridge />
        {children}
      </GlintAdminTheme>
    </ThemeContext.Provider>
  )
}

export const AdminTheme: FC<{ children: ReactNode }> = ({ children }) => {
  const [details, setDetails] = useState<CurrentUserDetails | null | undefined>(undefined)

  // First paint waits for the stored theme, so nothing ever renders in the wrong appearance.
  useEffect(() => { fetchCurrentUserDetails().then(setDetails) }, [])

  // The layout's static splash covers boot AND this fetch; drop it only after the themed shell has painted.
  useEffect(() => {
    if (details !== undefined) document.getElementById('admin-splash')?.remove()
  }, [details])

  if (details === undefined) return null

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
