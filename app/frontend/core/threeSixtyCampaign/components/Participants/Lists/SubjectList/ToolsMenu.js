import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = () => (
  <Menu>
    <Menu.Item key="1">Manage Data Sheets...</Menu.Item>
    <Menu.Item key="2">Manage Relationships...</Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">Download Participant List to CSV</Menu.Item>
    <Menu.Item key="4">Download All Reports...</Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5">Reset All Participants...</Menu.Item>
    <Menu.Item key="6">Reset All Nominations...</Menu.Item>
    <Menu.Divider />

    <Menu.Item key="7">View Prepaid Info...</Menu.Item>
    <Menu.Divider />

    <Menu.Item key="8">Manage Previous Jobs...</Menu.Item>
  </Menu>
)

export default ActionsMenu
