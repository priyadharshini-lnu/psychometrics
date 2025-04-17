import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { useParams } from 'react-router'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  onClick: (action: string) => void,
  permissions: { [key: string]: boolean; } | undefined,
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
  const params = useParams()

  const menuItems:ItemType[] = []

  const importMenuItems:ItemType[] = []

  if (permissions?.import) {
    importMenuItems.push({
      key: 'import_development_actions',
      label: I18n.t('administration.development_actions.import_development_actions'),
    })
  }

  if (permissions?.importTranslations) {
    importMenuItems.push({
      key: 'import_translations',
      label: I18n.t('administration.development_actions.import_development_actions_translations'),
    })
  }

  const exportMenuItems:ItemType[] = []

  if (permissions?.export) {
    exportMenuItems.push({
      key: 'export_development_action',
      label: I18n.t('administration.development_actions.export_development_actions'),
    })
  }


  if (permissions?.exportTranslations) {
    exportMenuItems.push({
      key: 'export_development_action_translations',
      label: I18n.t('administration.development_actions.export_development_action_translations'),
    })
  }

  if (permissions?.exportGlobal && !params.projectId) {
    exportMenuItems.push({
      key: 'export_global_development_actions',
      label: I18n.t('administration.development_actions.export_global_development_actions'),
    })
  }

  if (permissions?.exportGlobalTranslations && !params.projectId) {
    exportMenuItems.push({
      key: 'export_global_development_actions_translations',
      label: I18n.t('administration.development_actions.export_global_development_actions_translations'),
    })
  }

  if (permissions?.import) {
    menuItems.push({
      type: 'group',
      key: 'import_group',
      label: I18n.t('common.actions.import'),
      children: importMenuItems,
    })
  }

  if (permissions?.export) {
    menuItems.push({
      type: 'group',
      key: 'export_group',
      label: I18n.t('common.actions.export'),
      children: exportMenuItems,
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
