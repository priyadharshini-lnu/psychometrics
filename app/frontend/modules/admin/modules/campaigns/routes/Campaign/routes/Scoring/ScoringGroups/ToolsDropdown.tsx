import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Link } from 'react-router-dom'
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
        <span>{I18n.t('administration.scoring.weightages.tools')}</span>
        <DownOutlined />
      </Button>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)

const getMenuProps = (onClick): MenuProps => {
  const menuItems:ItemType[] = [
    {
      key: 'weightages',
      label: <Link to="weightages">{I18n.t('administration.scoring.weightages.weightages')}</Link>,
    },
    {
      key: 'variables',
      label: I18n.t('administration.scoring.variables'),
    },
    {
      key: 'export_factors',
      label: I18n.t('administration.scoring.export.factors'),
    },
    {
      key: 'import_factors',
      label: I18n.t('administration.scoring.import.factors'),
    },
  ]
  return ({ items: menuItems, onClick })
}
