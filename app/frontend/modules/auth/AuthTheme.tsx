import { FC, ReactNode } from 'react'
import { GlintThemeProvider } from '@thetalententerprise/glint'

import '@thetalententerprise/glint/fonts.css'

const { antdLocale, I18n } = window

type Props = { children: ReactNode }

export const AuthTheme: FC<Props> = ({ children }) => (
  <GlintThemeProvider
    direction={I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'}
    locale={antdLocale}
  >
    {children}
  </GlintThemeProvider>
)

export default AuthTheme
