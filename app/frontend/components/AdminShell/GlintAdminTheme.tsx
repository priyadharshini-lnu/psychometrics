import { FC, ReactNode } from 'react'
import {
  GlintThemeProvider,
  MARSH_LIGHT,
  MARSH_DARK,
  THEME_CATALOG,
} from '@thetalententerprise/glint'
import type { GlintMode, GlintThemeTokens } from '@thetalententerprise/glint'
import { isRtl } from '~/utils/locales'
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

export const DEFAULT_LIGHT = 'marsh-light'
export const DEFAULT_DARK = 'marsh-dark'

export type ThemeChoice = {
  mode: GlintMode
  light: string
  dark: string
}

/** What the admin renders with the theme switcher off — also the standalone-page default. */
export const DEFAULT_THEME_CHOICE: ThemeChoice = { mode: 'light', light: DEFAULT_LIGHT, dark: DEFAULT_DARK }

type Props = {
  choice?: ThemeChoice
  children: ReactNode
}

// Provider-free marsh theming: no redux, router or api, so standalone pages can mount it too.
export const GlintAdminTheme: FC<Props> = ({ choice = DEFAULT_THEME_CHOICE, children }) => (
  <GlintThemeProvider
    light={LIGHT_THEMES[choice.light] ?? MARSH_LIGHT}
    dark={DARK_THEMES[choice.dark] ?? MARSH_DARK}
    mode={choice.mode}
    direction={isRtl(I18n.currentLocale()) ? 'rtl' : 'ltr'}
    locale={antdLocale}
  >
    {children}
  </GlintThemeProvider>
)

export default GlintAdminTheme
