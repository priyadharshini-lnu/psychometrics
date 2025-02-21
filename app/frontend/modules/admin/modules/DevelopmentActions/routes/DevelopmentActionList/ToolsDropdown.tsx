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
  export_global: boolean
  export: boolean
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
        <span>{I18n.t('administration.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:ItemType[] = []

  if (permissions.import) {
    menuItems.push({
      key: 'import_development_actions',
      label: I18n.t('administration.development_actions.import_development_actions'),
    })
  }

  if (permissions.export_global) {
    menuItems.push({
      key: 'export_global_development_actions',
      label: I18n.t('administration.development_actions.export_global_development_actions'),
    })
  }

  if (permissions.export) {
    menuItems.push({
      key: 'export_development_action',
      label: I18n.t('administration.development_actions.export_development_actions'),
    })
  }


  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
