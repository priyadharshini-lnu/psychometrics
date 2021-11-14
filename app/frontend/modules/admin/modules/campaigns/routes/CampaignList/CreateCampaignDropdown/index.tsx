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
  const menu = (
    <Menu>
      <Menu.Item onClick={() => openModal('CommonCampaignFormModal', { projectId })} key="1">
        Add Normal Campaign
      </Menu.Item>
      <Menu.Item key="2" onClick={() => openModal('ThreesixtyCampaignFormModal', { projectId })}>
        Add 360 Campaign
      </Menu.Item>
    </Menu>
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
