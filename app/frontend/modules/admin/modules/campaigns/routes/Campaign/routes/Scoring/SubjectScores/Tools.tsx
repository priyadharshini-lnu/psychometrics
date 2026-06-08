import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Permissions = {
  export: boolean,
  import: boolean
}

type Props = {
  onClick: (action: string) => void,
  permissions: Permissions,
}

export const Tools: React.FC<Props> = ({
  onClick, permissions,
}: Props) => (
  <ConditionalDropdown
    menu={getMenuProps({ onClick, permissions })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('shared.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:MenuItem[] = []
  if (permissions?.export) {
    menuItems.push({
      key: 'export',
      label: I18n.t('admin.scoring_subject_list_export'),
    })
  }

  if (permissions?.import) {
    menuItems.push({
      key: 'import_external_scores',
      label: I18n.t('admin.scoring_subject_list_import_external_scores'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
