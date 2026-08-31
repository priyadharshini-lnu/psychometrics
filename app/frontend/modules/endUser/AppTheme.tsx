import {
  FC, ReactNode, createContext, useContext, useMemo, useState,
} from 'react'
import {
  GlintThemeProvider,
  MARSH_LIGHT,
  MARSH_DARK,
  EMBER_LIGHT,
  EMBER_DARK,
  PRIMER_LIGHT,
  PRIMER_DARK,
  PRIMER_LIGHT_COLORBLIND,
  PRIMER_DARK_COLORBLIND,
  PRIMER_LIGHT_HIGH_CONTRAST,
  PRIMER_DARK_DIMMED,
} from '@thetalententerprise/glint'
import type { GlintMode, GlintThemeTokens } from '@thetalententerprise/glint'

// Glint font @font-face lives here only; dynamically imported and mounted solely when
// `config.glintUi` is on, so the legacy path pulls in zero glint fonts.
import '@thetalententerprise/glint/fonts.css'

// The legacy asset pipeline ships `html { font-size: 10px }` and the 16px override
// (global.less) loads late as a vite module — glint sizes in rem, so without this the
// first paint renders at 62.5% scale. Pin the browser default before the glint tree
// mounts; the a11y font stepper adjusts this same inline value afterwards.
if (typeof document !== 'undefined'
  && !document.documentElement.style.getPropertyValue('font-size')) {
  document.documentElement.style.setProperty('font-size', '1rem')
}

const { antdLocale, I18n } = window

// The glint themes by appearance; light and dark are chosen independently
// (GitHub-style) and the mode decides which one is active.
export const LIGHT_THEMES: Record<string, GlintThemeTokens> = {
  marsh: MARSH_LIGHT,
  ember: EMBER_LIGHT,
  primer: PRIMER_LIGHT,
  'primer-colorblind': PRIMER_LIGHT_COLORBLIND,
  'primer-contrast': PRIMER_LIGHT_HIGH_CONTRAST,
}

export const DARK_THEMES: Record<string, GlintThemeTokens> = {
  marsh: MARSH_DARK,
  ember: EMBER_DARK,
  primer: PRIMER_DARK,
  'primer-colorblind': PRIMER_DARK_COLORBLIND,
  'primer-dimmed': PRIMER_DARK_DIMMED,
}

const DEFAULT_THEME = 'marsh'
const LIGHT_KEY = 'app:theme-light'
const DARK_KEY = 'app:theme-dark'
const LEGACY_THEME_KEY = 'app:theme'
const MODE_KEY = 'app:mode'
const MODES: readonly GlintMode[] = ['system', 'light', 'dark']

// localStorage hands back an unvalidated string; narrow it before it reaches the theme provider.
const isMode = (value: string | null): value is GlintMode => MODES.some(mode => mode === value)

const readThemeKey = (storageKey: string, themes: Record<string, GlintThemeTokens>): string => {
  try {
    const stored = window.localStorage.getItem(storageKey)
      // One-time migration from the retired pair-picker storage.
      ?? window.localStorage.getItem(LEGACY_THEME_KEY)
    return stored && stored in themes ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

const readMode = (): GlintMode => {
  try {
    const stored = window.localStorage.getItem(MODE_KEY)
    return isMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

type ModeContextValue = {
  mode: GlintMode
  setMode: (mode: GlintMode) => void
  lightKey: string
  setLightKey: (key: string) => void
  darkKey: string
  setDarkKey: (key: string) => void
}

// Persisted appearance mode + per-appearance theme picks; pages consume it
// for the top-bar appearance menu.
const ModeContext = createContext<ModeContextValue>({
  mode: 'system',
  setMode: () => {},
  lightKey: DEFAULT_THEME,
  setLightKey: () => {},
  darkKey: DEFAULT_THEME,
  setDarkKey: () => {},
})

export const useAppMode = () => useContext(ModeContext)

type Props = { children: ReactNode }

// Theme runtime for the flag-on end-user pages: glint themes only, no per-project theming.
const persist = (storageKey: string, value: string): void => {
  try {
    window.localStorage.setItem(storageKey, value)
  } catch {
    // Storage may be unavailable — the choice still applies in-session.
  }
}

export const AppTheme: FC<Props> = ({ children }) => {
  const [mode, setModeState] = useState<GlintMode>(readMode)
  const [lightKey, setLightKeyState] = useState<string>(() => readThemeKey(LIGHT_KEY, LIGHT_THEMES))
  const [darkKey, setDarkKeyState] = useState<string>(() => readThemeKey(DARK_KEY, DARK_THEMES))

  const setMode = (next: GlintMode) => {
    if (!MODES.includes(next)) return
    setModeState(next)
    persist(MODE_KEY, next)
  }

  const setLightKey = (key: string) => {
    if (!(key in LIGHT_THEMES)) return
    setLightKeyState(key)
    persist(LIGHT_KEY, key)
  }

  const setDarkKey = (key: string) => {
    if (!(key in DARK_THEMES)) return
    setDarkKeyState(key)
    persist(DARK_KEY, key)
  }

  const ctx = useMemo(() => ({
    mode, setMode, lightKey, setLightKey, darkKey, setDarkKey,
  }), [mode, lightKey, darkKey])

  return (
    <ModeContext.Provider value={ctx}>
      <GlintThemeProvider
        light={LIGHT_THEMES[lightKey] ?? LIGHT_THEMES[DEFAULT_THEME]}
        dark={DARK_THEMES[darkKey] ?? DARK_THEMES[DEFAULT_THEME]}
        mode={mode}
        direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
        locale={antdLocale}
      >
        {children}
      </GlintThemeProvider>
    </ModeContext.Provider>
  )
}

export default AppTheme
