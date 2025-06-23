import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
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
        <span>{I18n.t('administration.tools')}</span>
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
      label: I18n.t('administration.proficiency_levels.fields.title'),
    },
    {
      key: 'import_translations',
      label: I18n.t('administration.proficiency_levels.fields.proficiency_translations'),
    },
  ]

  const exportMenuItems:MenuItem[] = [
    {
      key: 'export_proficiency',
      label: I18n.t('administration.proficiency_levels.fields.title'),
    },
    {
      key: 'export_translations',
      label: I18n.t('administration.proficiency_levels.fields.proficiency_translations'),
    },
  ]

  menuItems.push({
    type: 'group',
    key: 'import_group',
    label: I18n.t('common.actions.import'),
    children: importMenuItems,
  })

  menuItems.push({
    type: 'group',
    key: 'export_group',
    label: I18n.t('common.actions.export'),
    children: exportMenuItems,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
