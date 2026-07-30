import {
  FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import {
  GlintThemeProvider,
  MARSH_LIGHT,
  MARSH_DARK,
  THEME_CATALOG,
} from '@thetalententerprise/glint'
import type { GlintMode, GlintThemeTokens } from '@thetalententerprise/glint'
import { isRtl } from '~/utils/locales'
import { useSetCssVars } from '~/hooks/useSetCssVars'
import { THEME_CATEGORY, THEME_CONFIG_KEY, useThemePreference } from './useThemePreference'
import { fetchCurrentUserDetails, findPreference } from './currentUserDetails'
import type { CurrentUserDetails } from './currentUserDetails'
// Brand faces + Material Symbols; without it every <Icon> renders its ligature text.
import '@thetalententerprise/glint/fonts.css'

const { antdLocale, I18n } = window

// Glass reads as haze over dense admin tables; the participant side still ships it.
const HIDDEN_THEME_KEYS = ['glass-light', 'glass-dark']

const byAppearance = (appearance: 'light' | 'dark'): Record<string, GlintThemeTokens> => Object.fromEntries(
  THEME_CATALOG
    .filter(entry => entry.appearance === appearance && !HIDDEN_THEME_KEYS.includes(entry.key))
    .map(entry => [entry.key, entry.theme]),
)

export const LIGHT_THEMES: Record<string, GlintThemeTokens> = byAppearance('light')
export const DARK_THEMES: Record<string, GlintThemeTokens> = byAppearance('dark')

/** Human labels for the catalog, keyed the same way. */
export const THEME_LABELS: Record<string, string> = Object.fromEntries(
  THEME_CATALOG.map(entry => [entry.key, entry.name]),
)

const DEFAULT_LIGHT = 'marsh-light'
const DEFAULT_DARK = 'marsh-dark'
const MODES: GlintMode[] = ['system', 'light', 'dark']

export const THEME_SWITCHER_ENABLED = window.PsyGlobalState?.features?.theme_switcher === true

type ThemeChoice = {
  mode: GlintMode
  light: string
  dark: string
}

const choiceFrom = (stored: Record<string, unknown> | null): ThemeChoice => {
  if (!THEME_SWITCHER_ENABLED) return { mode: 'light', light: DEFAULT_LIGHT, dark: DEFAULT_DARK }
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
      <GlintThemeProvider
        light={LIGHT_THEMES[choice.light] ?? MARSH_LIGHT}
        dark={DARK_THEMES[choice.dark] ?? MARSH_DARK}
        mode={choice.mode}
        direction={isRtl(I18n.currentLocale()) ? 'rtl' : 'ltr'}
        locale={antdLocale}
      >
        <LegacyCssVarBridge />
        {children}
      </GlintThemeProvider>
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
