import { FC } from 'react'
import {
  Input, Button, InputProps,
} from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

export const AccessiblePasswordInput:FC<InputProps> = props => (
  <Input.Password
    {...props}
    iconRender={visible => (
      <Button
        size="small"
        type="link"
        className="mt-0"
        icon={visible ? (<EyeTwoTone />) : <EyeInvisibleOutlined />}
        aria-label={visible ? I18n.t('auth.login.hide_password') : I18n.t('auth.login.show_password')}
      />
    )}
  />
)
