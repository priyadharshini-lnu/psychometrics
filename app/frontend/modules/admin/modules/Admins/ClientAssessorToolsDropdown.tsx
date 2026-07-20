import React from 'react'
import { Button, MenuProps } from 'antd'
import {
  PlusOutlined, DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

interface Props {
  onAdd?: () => void
  onImport?: () => void
}

const getMenuProps = ({ onAdd, onImport }: Props): MenuProps => {
  const menuItems: MenuItem[] = [
    { key: 'add_assessor', label: I18n.t('admin.add_client_assessor') },
    { key: 'import_assessors', label: I18n.t('admin.assessor_modals_import_title') },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'add_assessor') onAdd?.()
    if (key === 'import_assessors') onImport?.()
  }

  return { items: menuItems, onClick: handleMenuClick }
}

export const ClientAssessorActionsDropdown: React.FC<Props> = ({ onAdd, onImport }) => (
  <ConditionalDropdown
    menu={getMenuProps({ onAdd, onImport })}
    innerElement={(
      <Button type="primary">
        <PlusOutlined />
        <span>{I18n.t('admin.add_client_assessor')}</span>
        <DownOutlined />
      </Button>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)

export default ClientAssessorActionsDropdown
