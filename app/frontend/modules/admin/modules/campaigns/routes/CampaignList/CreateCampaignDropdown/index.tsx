import React from 'react'
import {
  Button, Dropdown,
} from 'antd'
import { PlusOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

interface Props {
  openModal(name: string, data?: { projectId: number }): void
  projectId: number
}

const { I18n } = window

const CreateCampaignDropdown: React.FC<Props> = ({ openModal, projectId }) => {
  const menuItems = [
    { key: 'add_common_campaign', label: I18n.t('admin.campaigns_menus_add_common_campaign') },
    { key: 'add_360_campaign', label: I18n.t('admin.campaigns_menus_add_multi_rater_campaign') },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'add_common_campaign') {
      openModal('CommonCampaignFormModal', { projectId })
    }
    if (key === 'add_360_campaign') {
      openModal('ThreesixtyCampaignFormModal', { projectId })
    }
  }

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} className="mrm" trigger={['click']}>
      <Button type="primary">
        <PlusOutlined />
        <span>{I18n.t('common.actions.add')}</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateCampaignDropdown
