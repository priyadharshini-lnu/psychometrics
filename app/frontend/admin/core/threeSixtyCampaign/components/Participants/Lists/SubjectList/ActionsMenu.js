import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = () => (
  <Menu>
    <Menu.Item key="0">
      <a href="nth">Login</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="nth">View Report</a>
    </Menu.Item>
    <Menu.Item key="2">
      <a href="nth">View Responses Received</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">
      <a href="nth">Approve Report...</a>
    </Menu.Item>
    <Menu.Item key="4">
      <a href="nth">Remove Report Approval...</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5">
      <a href="nth">Release Report...</a>
    </Menu.Item>
    <Menu.Item key="6">
      <a href="nth">Hold Report...</a>
    </Menu.Item>
    <Menu.Item key="7">
      <a href="nth">Remove Report Hold/Release...</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="8">
      <a href="nth">Mark As Done...</a>
    </Menu.Item>
    <Menu.Item key="9">
      <a href="nth">Unmark As Done...</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="10">
      <a href="nth">Remove From Project...</a>
    </Menu.Item>
  </Menu>
)

export default ActionsMenu
