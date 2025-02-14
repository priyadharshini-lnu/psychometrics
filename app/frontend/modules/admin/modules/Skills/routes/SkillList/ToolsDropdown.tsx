import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Permissions = {
  import: boolean
}

type Props = {
  onClick: (action: string) => void,
  permissions: Permissions,
}

export const ToolsDropdown: React.FC<Props> = ({
  onClick, permissions,
}: Props) => (
  <ConditionalDropdown
    menu={getMenuProps({ onClick, permissions })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('administration.skills.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:ItemType[] = []

  if (permissions?.import) {
    menuItems.push({
      key: 'import_skills',
      label: I18n.t('administration.skills.import_skills'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
