import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = ({ user, campaignId, removeUser }) => (
  <Menu>
    <Menu.Item key="0">
      <a
        href={`/administration/threesixty_campaigns/${campaignId}/participants/${
          user.id
        }/spoof`}
      >
        Login
      </a>
    </Menu.Item>
    <Menu.Item key="11">
      <div
        onClick={() => removeUser(campaignId, user.id)}
        role="button"
        tabIndex={-1}
      >
        Remove from campaign...
      </div>
    </Menu.Item>
  </Menu>
)

export default ActionsMenu
