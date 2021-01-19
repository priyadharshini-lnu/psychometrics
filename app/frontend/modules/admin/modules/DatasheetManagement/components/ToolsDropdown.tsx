import React, { FC } from 'react'
import { Dropdown, Button, Menu } from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'

// TODO: Feature yet to be implemented
export const ToolsDropdown: FC = () => {
  const toolsMenu = (
    <Menu>
      <Menu.Item key="import">Import datasheet</Menu.Item>
      <Menu.Item key="export">Export as CSV</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={toolsMenu} trigger={['click']}>
      <Button>
        <ToolOutlined />
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}
