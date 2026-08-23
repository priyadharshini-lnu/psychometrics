import { FC } from 'react'
import { ConfigProvider, Input, InputProps } from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

/* antd's toggle span is already role=button, focusable and locale-labelled; a nested Button doubled the tab stop. */
export const AccessiblePasswordInput:FC<InputProps> = props => (
  <ConfigProvider
    locale={{
      locale: I18n.locale,
      global: {
        show: I18n.t('auth.login.show_password'),
        hide: I18n.t('auth.login.hide_password'),
      },
    }}
  >
    <Input.Password
      {...props}
      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
    />
  </ConfigProvider>
)
