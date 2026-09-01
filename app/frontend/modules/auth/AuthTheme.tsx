import {
  FC, ReactNode, useEffect, useMemo,
} from 'react'
import { useSelector } from 'react-redux'
import {
  composeCustomTheme, GlintThemeProvider, MARSH_DARK, MARSH_LIGHT,
} from '@thetalententerprise/glint'

import '@thetalententerprise/glint/fonts.css'

import { RootState } from './core/reducers'

const { antdLocale, I18n } = window
const { theme_switcher } = window.PsyGlobalState.features

const MODE = theme_switcher ? 'system' : 'light'

type Props = { children: ReactNode }

export const AuthTheme: FC<Props> = ({ children }) => {
  const primaryColor = useSelector((state: RootState) => state.projectConfig.primary_color)

  useEffect(() => { document.getElementById('admin-splash')?.remove() }, [])

  const themes = useMemo(() => {
    if (!primaryColor) return { light: MARSH_LIGHT, dark: MARSH_DARK }

    const seed = {
      colorPrimary: primaryColor,
      colorLink: primaryColor,
      colorTextHeading: primaryColor,
    }

    return {
      light: composeCustomTheme(MARSH_LIGHT, seed),
      dark: composeCustomTheme(MARSH_DARK, seed),
    }
  }, [primaryColor])

  return (
    <GlintThemeProvider
      light={themes.light}
      dark={themes.dark}
      mode={MODE}
      direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
      locale={antdLocale}
    >
      {children}
    </GlintThemeProvider>
  )
}

export default AuthTheme
