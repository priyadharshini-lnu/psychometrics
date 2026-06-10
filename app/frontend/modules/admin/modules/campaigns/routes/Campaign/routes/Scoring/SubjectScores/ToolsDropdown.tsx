import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined, MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Persmission = {
  changeFinalizedCampaignScore?: boolean,
  rescore?: boolean,
  pushWebhook?: boolean,
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
    <Button disabled={isDisabled}>
      <ToolOutlined />
      <span>{I18n.t('shared.actions')}</span>
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
  const menuItems:MenuItem[] = []
  if (persmission?.changeFinalizedCampaignScore) {
    menuItems.push({
      key: 'mark_finalized',
      label: I18n.t('admin.scoring_subject_list_mark_finalized'),
    })
  }
  if (persmission?.changeFinalizedCampaignScore) {
    menuItems.push({
      key: 'mark_not_finalized',
      label: I18n.t('admin.scoring_subject_list_mark_not_finalized'),
    })
  }
  if (persmission?.rescore) {
    menuItems.push({
      key: 'rescore',
      label: I18n.t('admin.scoring_subject_list_rescore'),
    })
  }
  if (persmission?.pushWebhook) {
    menuItems.push({
      key: 'push_webhook',
      label: I18n.t('admin.scoring_subject_list_push_webhook'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
