import { FC } from 'react'
import { ConfigProvider, ThemeConfig, App } from 'antd'
import { ConfigProviderProps } from 'antd/es/config-provider'
import { useSetCssVars } from '~/hooks/useSetCssVars'
import { constants } from './constants'

const { DEFAULT_PRIMARY_COLOR, DEFAULT_BORDER_RADIUS } = constants
type Props = {
  theme?: ThemeConfig
  children: React.ReactNode
} & ConfigProviderProps

// Outermost antd provider; AdminTheme nests inside and overrides its tokens, so these apply outside the admin shell.
export const DefaultAntThemeWrapper:FC<Props> = ({ theme, children, ...props }) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: DEFAULT_PRIMARY_COLOR,
        borderRadius: DEFAULT_BORDER_RADIUS,
        colorLink: DEFAULT_PRIMARY_COLOR,
      },
      ...theme,
    }
  }
    {...props}
  >
    <App>
      <EmptyComponentForSettingCssVars />
      {children}
    </App>
  </ConfigProvider>
)

const EmptyComponentForSettingCssVars = () => {
  useSetCssVars()
  return <></>
}
