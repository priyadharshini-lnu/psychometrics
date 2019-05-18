import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = ({ user, campaignId }) => (
  <Menu>
    <Menu.Item key="0">
      <a href={`/administration/threesixty_campaigns/${campaignId}/participants/${user.id}/spoof`}>Login</a>
    </Menu.Item>
    <Menu.Item key="1">
      <a href="nth">Remove From Project...</a>
    </Menu.Item>
  </Menu>
)

export default ActionsMenu
