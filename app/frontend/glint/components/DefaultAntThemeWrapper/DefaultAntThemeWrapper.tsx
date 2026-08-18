import { FC } from 'react'
import { ConfigProvider, ThemeConfig, App } from 'antd'
import { ConfigProviderProps } from 'antd/es/config-provider'
import { useSetCssVars } from '~/hooks/useSetCssVars'
import { constants } from './constants'
import { seedTintAlgorithm } from './algorithm'

const {
  DEFAULT_PRIMARY_COLOR, DEFAULT_BORDER_RADIUS, DEFAULT_BORDER_RADIUS_XS,
  DEFAULT_FONT_FAMILY, DEFAULT_BUTTON_SHADOW,
  DEFAULT_BUTTON_HEIGHT, DEFAULT_BUTTON_HEIGHT_SM, DEFAULT_BUTTON_HEIGHT_LG,
} = constants
type Props = {
  theme?: ThemeConfig
  children: React.ReactNode
} & ConfigProviderProps

// Outermost antd provider; AdminTheme nests inside and overrides its tokens, so these apply outside the admin shell.
// The caller's token is merged key-by-key — spreading it wholesale dropped every default it did not restate.
// seedTintAlgorithm re-derives the light primary surfaces from whatever colorPrimary is active, so a project's
// custom brand color stays on-brand without any caller having to restate colorPrimaryBg.
export const DefaultAntThemeWrapper:FC<Props> = ({ theme, children, ...props }) => (
  <ConfigProvider
    theme={{
      ...theme,
      algorithm: theme?.algorithm ?? seedTintAlgorithm,
      token: {
        colorPrimary: DEFAULT_PRIMARY_COLOR,
        colorLink: DEFAULT_PRIMARY_COLOR,
        borderRadius: DEFAULT_BORDER_RADIUS,
        borderRadiusLG: DEFAULT_BORDER_RADIUS,
        borderRadiusSM: DEFAULT_BORDER_RADIUS,
        borderRadiusOuter: DEFAULT_BORDER_RADIUS,
        borderRadiusXS: DEFAULT_BORDER_RADIUS_XS,
        fontFamily: DEFAULT_FONT_FAMILY,
        ...theme?.token,
      },
      components: {
        ...theme?.components,
        Button: {
          controlHeight: DEFAULT_BUTTON_HEIGHT,
          controlHeightSM: DEFAULT_BUTTON_HEIGHT_SM,
          controlHeightLG: DEFAULT_BUTTON_HEIGHT_LG,
          primaryShadow: DEFAULT_BUTTON_SHADOW,
          defaultShadow: DEFAULT_BUTTON_SHADOW,
          dangerShadow: DEFAULT_BUTTON_SHADOW,
          ...theme?.components?.Button,
        },
      },
    }}
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
