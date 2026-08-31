import {
  FC, ReactNode, createContext, useContext, useEffect, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  AppShell, Flex, FontSizeControl, ThemeSwitcher,
} from '@thetalententerprise/glint'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { LangControl } from '~/components/LangControl'
import { DARK_THEMES, LIGHT_THEMES, useAppMode } from '~/modules/endUser/AppTheme'
import { RailBrand, RailProfile, useDashboardNav } from './Rail'
import { PageFooter } from './Footer'

const { I18n } = window

const SIDER_COLLAPSED_KEY = 'dashboard:sider-collapsed'

const readCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(SIDER_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

const writeCollapsed = (value: boolean): void => {
  try {
    window.localStorage.setItem(SIDER_COLLAPSED_KEY, String(value))
  } catch {
    // Storage may be unavailable (private mode) — collapse still works in-session.
  }
}

// Accessibility font-size scale: an inline rem size on <html>, clamped (legacy parity).
const FONT_STEP = 0.125
const FONT_MAX = 1.5
const FONT_MIN = 0.75

const currentFontSize = (): number => parseFloat(
  document.documentElement.style.getPropertyValue('font-size') || '1rem',
)

const setFontSize = (rem: number): void => {
  if (rem >= FONT_MIN && rem <= FONT_MAX) {
    document.documentElement.style.setProperty('font-size', `${rem}rem`)
    document.body.style.setProperty('font-size', `${rem}rem`)
  }
}

// The shell mounts ONCE at the route seam and pages swap inside it (no rail
// flash on navigation). Pages inject their top-bar content through this slot.
const TopBarStartContext = createContext<(node: ReactNode | null) => void>(() => {})

/** Renders `node` in the shared top bar's inline-start slot for this page's lifetime. */
export const useTopBarStart = (node: ReactNode): void => {
  const setSlot = useContext(TopBarStartContext)
  useEffect(() => { setSlot(node) })
  useEffect(() => () => setSlot(null), [setSlot])
}

const connector = connect((state: RootState) => ({
  updateProfileRequired: state.currentUser.updateProfileRequired,
}))

type PropsFromRedux = ConnectedProps<typeof connector>

export type UserPageProps = PropsFromRedux & {
  /** Inline-start slot of the top bar (back button, countdown pill…). */
  topBarStart?: ReactNode
  children?: ReactNode
}

// The signed-in glint page chrome shared by every flag-on end-user page: AppShell with
// the rail (brand / nav / profile), top-bar controls (appearance, font size, language)
// and the footer. Pages compose only their content column (and optional topBarStart).
export const UserPageComponent: FC<UserPageProps> = ({
  updateProfileRequired,
  topBarStart,
  children,
}) => {
  const nav = useDashboardNav(updateProfileRequired)
  const [slotNode, setSlotNode] = useState<ReactNode>(null)
  const {
    mode, setMode, lightKey, setLightKey, darkKey, setDarkKey,
  } = useAppMode()

  // The choices are the theme registries themselves — previews and swatches
  // are drawn from each theme's own tokens inside glint.
  const themeLabel: Record<string, string> = {
    marsh: I18n.t('enduser.theme_marsh'),
    ember: I18n.t('enduser.theme_ember'),
    primer: I18n.t('enduser.theme_primer'),
    'primer-colorblind': I18n.t('enduser.theme_primer_colorblind'),
    'primer-contrast': I18n.t('enduser.theme_primer_contrast'),
    'primer-dimmed': I18n.t('enduser.theme_primer_dimmed'),
  }
  const choicesOf = (themes: Record<string, unknown>) => Object.entries(themes)
    .map(([key, theme]) => ({ key, label: themeLabel[key] ?? key, theme: theme as never }))

  return (
    <AppShell
      brand={collapsed => (
        <RailBrand collapsed={collapsed} updateProfileRequired={updateProfileRequired} />
      )}
      nav={nav}
      siderFooter={collapsed => <RailProfile collapsed={collapsed} />}
      topBarStart={topBarStart ?? slotNode}
      topBarEnd={(
        <Flex align="center" gap="small">
          <ThemeSwitcher
            lightThemes={choicesOf(LIGHT_THEMES)}
            darkThemes={choicesOf(DARK_THEMES)}
            lightValue={lightKey}
            darkValue={darkKey}
            onLightChange={setLightKey}
            onDarkChange={setDarkKey}
            mode={mode}
            onModeChange={setMode}
            labels={{
              mode: I18n.t('enduser.theme_mode_title'),
              system: I18n.t('enduser.theme_mode_system'),
              light: I18n.t('enduser.theme_mode_light'),
              dark: I18n.t('enduser.theme_mode_dark'),
              lightTheme: I18n.t('enduser.theme_light_theme'),
              darkTheme: I18n.t('enduser.theme_dark_theme'),
              active: I18n.t('enduser.theme_active'),
            }}
            aria-label={I18n.t('enduser.appearance')}
          />
          <FontSizeControl
            onIncrease={() => setFontSize(currentFontSize() + FONT_STEP)}
            onDecrease={() => setFontSize(currentFontSize() - FONT_STEP)}
            onReset={() => setFontSize(1)}
            aria-label={I18n.t('glint.fontsize_modifier.change_font', { defaultValue: 'Change font size' })}
            increaseLabel={I18n.t('glint.fontsize_modifier.increase_font', { defaultValue: 'Increase font size' })}
            decreaseLabel={I18n.t('glint.fontsize_modifier.decrease_font', { defaultValue: 'Decrease font size' })}
            resetLabel={I18n.t('glint.fontsize_modifier.reset_font', { defaultValue: 'Reset font size' })}
          />
          <LangControl />
        </Flex>
      )}
      footer={<PageFooter />}
      defaultCollapsed={readCollapsed()}
      onCollapsedChange={writeCollapsed}
      collapseLabel={I18n.t('enduser.collapse_navigation')}
      expandLabel={I18n.t('enduser.open_navigation')}
      skipToContentLabel={I18n.t('frontend.skip_to_content')}
      contentId="user-page-main-content"
    >
      <TopBarStartContext.Provider value={setSlotNode}>
        {children}
      </TopBarStartContext.Provider>
    </AppShell>
  )
}

export const UserPage = connector(UserPageComponent)

export default UserPage
