import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Link } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

export const ToolsDropdown: React.FC = () => (
  <ConditionalDropdown
    menu={getMenuProps()}
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

const getMenuProps = (): MenuProps => {
  const menuItems:ItemType[] = [
    {
      key: 'weightages',
      label: <Link to="scoring/settings/weightages">{I18n.t('administration.scoring.weightages.weightages')}</Link>,
    },
  ]
  return ({ items: menuItems })
}
