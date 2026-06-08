import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

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
      key: 'import_proficiency',
      label: I18n.t('admin.proficiency_levels_fields_title'),
    },
    {
      key: 'import_translations',
      label: I18n.t('admin.fields_proficiency_translations'),
    },
  ]

  const exportMenuItems:MenuItem[] = [
    {
      key: 'export_proficiency',
      label: I18n.t('admin.proficiency_levels_fields_title'),
    },
    {
      key: 'export_translations',
      label: I18n.t('admin.fields_proficiency_translations'),
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
