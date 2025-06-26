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
      key: 'import_translations',
      label: I18n.t('administration.job_role.translations'),
    },
  ]

  const exportMenuItems:MenuItem[] = [
    {
      key: 'export_translations',
      label: I18n.t('administration.job_role.translations'),
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
