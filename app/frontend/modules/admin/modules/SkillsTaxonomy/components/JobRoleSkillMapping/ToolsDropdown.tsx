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
      key: 'import_taxonomy',
      label: I18n.t('administration.job_role_skill_mapping.import.taxonomy'),
    },
  ]

  menuItems.push({
    type: 'group',
    key: 'import_group',
    label: I18n.t('common.actions.import'),
    children: importMenuItems,
  })

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
