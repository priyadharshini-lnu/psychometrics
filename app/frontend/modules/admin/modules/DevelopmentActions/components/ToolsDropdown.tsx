import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { useParams } from 'react-router'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
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
        <span>{I18n.t('admin.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, permissions }: Props): MenuProps => {
  const params = useParams()

  const menuItems:MenuItem[] = []

  const importMenuItems:MenuItem[] = []

  if (permissions?.import) {
    importMenuItems.push({
      key: 'import_development_actions',
      label: I18n.t('admin.development_actions_import_development_actions'),
    })
  }

  if (permissions?.importTranslations) {
    importMenuItems.push({
      key: 'import_translations',
      label: I18n.t('admin.development_actions_import_development_actions_translations'),
    })
  }

  const exportMenuItems:MenuItem[] = []

  if (permissions?.export && params.projectId) {
    exportMenuItems.push({
      key: 'export_development_action',
      label: I18n.t('admin.development_actions_export_development_actions'),
    })
  }


  if (permissions?.exportTranslations && params.projectId) {
    exportMenuItems.push({
      key: 'export_development_action_translations',
      label: I18n.t('admin.development_actions_export_development_action_translations'),
    })
  }

  if (permissions?.exportGlobal && !params.projectId) {
    exportMenuItems.push({
      key: 'export_global_development_actions',
      label: I18n.t('admin.development_actions_export_development_actions'),
    })
  }

  if (permissions?.exportGlobalTranslations && !params.projectId) {
    exportMenuItems.push({
      key: 'export_global_development_actions_translations',
      label: I18n.t('admin.development_actions_export_development_action_translations'),
    })
  }

  if (permissions?.import) {
    menuItems.push({
      type: 'group',
      key: 'import_group',
      label: I18n.t('shared.import'),
      children: importMenuItems,
    })
  }

  if (permissions?.export) {
    menuItems.push({
      type: 'group',
      key: 'export_group',
      label: I18n.t('shared.export'),
      children: exportMenuItems,
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
