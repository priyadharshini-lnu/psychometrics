import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Permissions = {
  resendInvite?: boolean
  create?: boolean
}

type Props = {
  isBulk?: boolean,
  onClick: (action: string) => void,
  permissions?: Permissions,
  isDisabled?: boolean,
}

export const ActionsDropdown: React.FC<Props> = ({
  isBulk, onClick, permissions, isDisabled,
}: Props) => {
  const btn = (
    <Button>
      <ToolOutlined />
      <span>{I18n.t('shared.actions')}</span>
      <DownOutlined />
    </Button>
  )
  if (isDisabled) {
    return (btn)
  }
  return (
    <ConditionalDropdown
      menu={getMenuProps({ onClick, isBulk, permissions })}
      innerElement={isBulk ? btn : undefined}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:MenuItem[] = []

  if (permissions?.resendInvite) {
    menuItems.push({
      key: 'resend_invite',
      label: I18n.t('admin.resend_invite_title'),
    })
  }
  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
