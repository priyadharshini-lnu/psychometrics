import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Props = {
  isBulk?: boolean,
  onClick: (action: string) => void,
}

export const ToolsDropdown: React.FC<Props> = ({ isBulk, onClick }: Props) => (
  <ConditionalDropdown
    menu={getMenuProps({ onClick, isBulk })}
    innerElement={isBulk ? (
      <Button>
        <ToolOutlined />
        <span>{I18n.t('administration.scoring.subject_list.actions')}</span>
        <DownOutlined />
      </Button>
    ) : (
      <a>
        <MoreOutlined />
      </a>
    )}
    className="mrm"
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick }: Props): MenuProps => {
  const menuItems:ItemType[] = [
    {
      key: 'mark_finalized',
      label: I18n.t('administration.scoring.subject_list.mark_finalized'),
    },
    {
      key: 'mark_not_finalized',
      label: I18n.t('administration.scoring.subject_list.mark_not_finalized'),
    },
    {
      key: 'rescore',
      label: I18n.t('administration.scoring.subject_list.rescore'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
