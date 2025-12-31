import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
      <span>{I18n.t('administration.scoring.subject_list.actions')}</span>
      <DownOutlined />
    </Button>
  )
  if (isDisabled) {
    return (btn)
  }
  return (
    <ConditionalDropdown
      menu={getMenuProps({ onClick, isBulk, permissions })}
      innerElement={isBulk ? (btn) : (
        <a>
          <MoreOutlined />
        </a>
      )}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:MenuItem[] = []

  if (permissions?.resendInvite) {
    menuItems.push({
      key: 'resend_invite',
      label: I18n.t('administration.invited_subject.resend_invite.title'),
    })
  }
  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
