import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'

const menu = ({
  campaignId, projectId,
}) => (
  <Menu>
    <Menu.Item key="1">
      <a href={`/administration/projects/${projectId}/new_campaigns/${campaignId}/users.csv`}>Export Users</a>
    </Menu.Item>
  </Menu>
)

interface Props {
  campaignId: number
  projectId: number
}

const ToolsDropdown: React.FC<Props> = ({ campaignId, projectId }) => (
  <Dropdown
    overlay={menu({
      campaignId,
      projectId,
    })}
    className="mrm"
    trigger={['click']}
  >
    <Button>
      <ToolOutlined />
      <span>Tools</span>
      <DownOutlined />
    </Button>
  </Dropdown>
)

export default ToolsDropdown
