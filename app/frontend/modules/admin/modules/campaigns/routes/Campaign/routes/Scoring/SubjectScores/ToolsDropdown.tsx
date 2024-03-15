import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Persmission = {
  changeFinalizedCampaignScore?: boolean,
  rescore?: boolean,
}

type Props = {
  isBulk?: boolean,
  onClick: (action: string) => void,
  persmission: Persmission,
  isDisabled?: boolean,
}

export const ToolsDropdown: React.FC<Props> = ({
  isBulk, onClick, persmission, isDisabled,
}: Props) => {
  const btn = (
    <Button>
      <ToolOutlined />
      <span>{I18n.t('administration.scoring.subject_list.actions')}</span>
      <DownOutlined />
    </Button>
  )
  if (isDisabled) {
    return (btn)
  }
  return (
    <ConditionalDropdown
      menu={getMenuProps({ onClick, isBulk, persmission })}
      innerElement={isBulk ? (btn) : (
        <a>
          <MoreOutlined />
        </a>
      )}
      className="mrm"
    />
  )
}

const getMenuProps = ({ onClick, persmission }: Props): MenuProps => {
  const menuItems:ItemType[] = []
  if (persmission?.changeFinalizedCampaignScore) {
    menuItems.push({
      key: 'mark_finalized',
      label: I18n.t('administration.scoring.subject_list.mark_finalized'),
    })
  }
  if (persmission?.changeFinalizedCampaignScore) {
    menuItems.push({
      key: 'mark_not_finalized',
      label: I18n.t('administration.scoring.subject_list.mark_not_finalized'),
    })
  }
  if (persmission?.rescore) {
    menuItems.push({
      key: 'rescore',
      label: I18n.t('administration.scoring.subject_list.rescore'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
