import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { Link } from 'react-router-dom'
import { ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type ToolsDropdownProps = {
  onClick?: ({ key }) => void
}

export const ToolsDropdown: React.FC<ToolsDropdownProps> = ({ onClick }) => (
  <ConditionalDropdown
    menu={getMenuProps(onClick)}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('shared.tools')}</span>
        <DownOutlined />
      </Button>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)

const getMenuProps = (onClick): MenuProps => {
  const menuItems:MenuItem[] = [
    {
      key: 'weightages',
      label: <Link to="weightages">{I18n.t('admin.scoring_weightages_weightages')}</Link>,
    },
    {
      key: 'variables',
      label: I18n.t('admin.scoring_variables'),
    },
    {
      key: 'export_factors',
      label: I18n.t('admin.scoring_export_factors'),
    },
    {
      key: 'import_factors',
      label: I18n.t('admin.scoring_import_factors'),
    },
    {
      key: 'remove_all_campaign_factors',
      label: I18n.t('admin.scoring_remove_all_campaign_factors_title'),
    },
  ]
  return ({ items: menuItems, onClick })
}
