import { FC } from 'react'
import { AppearancePanel } from '@thetalententerprise/glint'
import {
  useAdminTheme, LIGHT_THEMES, DARK_THEMES, THEME_LABELS,
} from '~/components/AdminShell'

const { I18n } = window

// AppearancePanel, not ThemeSwitcher: a popover nested in a Dropdown cramps and closes it; the menu is the trigger.
export const AppearanceMenuItem: FC = () => {
  const {
    mode, light, dark, setMode, setLight, setDark,
  } = useAdminTheme()

  // Labels fall back to glint catalog names so new themes work without locale entries.
  const choices = (themes: typeof LIGHT_THEMES) => Object.entries(themes).map(([key, theme]) => ({
    key,
    label: I18n.t(`admin.themes.${key}`, { defaultValue: THEME_LABELS[key] ?? key }),
    theme,
  }))

  return (
    <AppearancePanel
      lightThemes={choices(LIGHT_THEMES)}
      darkThemes={choices(DARK_THEMES)}
      lightValue={light}
      darkValue={dark}
      onLightChange={setLight}
      onDarkChange={setDark}
      mode={mode}
      onModeChange={setMode}
      labels={{
        mode: I18n.t('admin.appearance'),
        system: I18n.t('admin.appearance_system'),
        light: I18n.t('admin.appearance_light'),
        dark: I18n.t('admin.appearance_dark'),
      }}
    />
  )
}

export default AppearanceMenuItem
