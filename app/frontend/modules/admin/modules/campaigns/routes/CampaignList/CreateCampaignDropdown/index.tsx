import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'

interface Props {
  openModal(name: string, data?: { projectId: number }): void
  projectId: number
}

const CreateCampaignDropdown: React.FC<Props> = ({ openModal, projectId }) => {
  const menuItems = [
    { key: 'add_normal_campaign', label: 'Add Normal Campaign' },
    { key: 'add_360_campaign', label: 'Add 360 Campaign' },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'add_normal_campaign') {
      openModal('CommonCampaignFormModal', { projectId })
    }
    if (key === 'add_360_campaign') {
      openModal('ThreesixtyCampaignFormModal', { projectId })
    }
  }
  const menu = (
    <Menu items={menuItems} onClick={handleMenuClick} />
  )

  return (
    <Dropdown overlay={menu} className="mrm" trigger={['click']}>
      <Button type="primary">
        <PlusOutlined />
        <span>Add Campaign</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateCampaignDropdown
