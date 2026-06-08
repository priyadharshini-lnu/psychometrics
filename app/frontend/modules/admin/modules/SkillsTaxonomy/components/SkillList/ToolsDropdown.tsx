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
  permissions:{ [key: string]: boolean; } | undefined,
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
      key: 'import_skills',
      label: I18n.t('admin.skills_title'),
    })
  }

  if (permissions?.importTranslations) {
    importMenuItems.push({
      key: 'import_translations',
      label: I18n.t('admin.skills_skill_translations'),
    })
  }

  const exportMenuItems:MenuItem[] = []

  if (permissions?.export) {
    exportMenuItems.push({
      key: 'export_skills',
      label: I18n.t('admin.skills_title'),
    })
  }

  if (permissions?.exportTranslations) {
    exportMenuItems.push({
      key: 'export_skills_translations',
      label: I18n.t('admin.skills_skill_translations'),
    })
  }

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

  if (permissions?.generateEmbedding && !params.projectId) {
    menuItems.push({
      type: 'group',
      key: 'vectordb',
      label: I18n.t('admin.skills_vector_label'),
      children: [
        {
          key: 'generate_embedding_skills',
          label: I18n.t('admin.skills_vector_generate_embedding'),
        },
      ],
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
