import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
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
        <span>{I18n.t('administration.scoring.subject_list.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const menuItems:ItemType[] = []
  if (permissions?.export) {
    menuItems.push({
      key: 'export',
      label: I18n.t('administration.scoring.subject_list.export'),
    })
  }

  if (permissions?.import) {
    menuItems.push({
      key: 'import_external_scores',
      label: I18n.t('administration.scoring.subject_list.import_external_scores'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
