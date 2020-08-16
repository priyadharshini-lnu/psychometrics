import React from 'react'
import {
  Button, Dropdown, Menu,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'

const menu = ({
  campaignId,
}) => (
  <Menu>
    <Menu.Item key="1">
      <a href={`/administration/new_campaigns/${campaignId}/users.csv`}>Export Users</a>
    </Menu.Item>
  </Menu>
)

interface Props {
  campaignId: number
}

const ToolsDropdown: React.FC<Props> = ({ campaignId }) => (
  <Dropdown
    overlay={menu({
      campaignId,
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
