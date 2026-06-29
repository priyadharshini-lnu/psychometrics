import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { DownOutlined, ToolOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

type Props = {
  onClick: (action: string) => void,
}

export const ToolsDropdown: React.FC<Props> = ({
  onClick,
}: Props) => (
  <ConditionalDropdown
    menu={getMenuProps({ onClick })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('admin.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick }: Props): MenuProps => {
  const menuItems:MenuItem[] = []

  const importMenuItems:MenuItem[] = [
    {
      key: 'import_translations',
      label: I18n.t('admin.job_role_translations'),
    },
  ]

  const exportMenuItems:MenuItem[] = [
    {
      key: 'export_translations',
      label: I18n.t('admin.job_role_translations'),
    },
  ]

  menuItems.push({
    type: 'group',
    key: 'import_group',
    label: I18n.t('shared.import'),
    children: importMenuItems,
  })

  menuItems.push({
    type: 'group',
    key: 'export_group',
    label: I18n.t('shared.export'),
    children: exportMenuItems,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
