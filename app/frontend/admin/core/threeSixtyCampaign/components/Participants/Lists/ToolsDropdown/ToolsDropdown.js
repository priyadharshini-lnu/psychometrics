import React from 'react'
import {
  Button, Dropdown, Icon, Menu,
} from 'antd'

const menu = ({
  projectId, campaignId, resetCampaign, resetAllNominations, openModal
}) => (
  <Menu>
    <Menu.Item key="1">
      <a href={`/administration/clients/${projectId}/datasheet_rows`}>Manage Data Sheets...</a>
    </Menu.Item>
    <Menu.Item key="2">
      <a onClick={() => openModal('ManageRelationshipsModal')}>Manage Relationships...</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="4">
      <a href={`/administration/threesixty_campaigns/${campaignId}/export_completion_status.xlsx`} download>
          Export Completion Status
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5">
      <div onClick={() => resetCampaign(campaignId)} role="button" tabIndex={-1}>
          Reset All Participants...
      </div>
    </Menu.Item>
    <Menu.Item key="6">
      <div
        onClick={() => resetAllNominations(campaignId)}
        role="button"
        tabIndex={-1}
      >
          Reset All Nominations...
      </div>
    </Menu.Item>
  </Menu>
)

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, openModal, match: { params: { campaignId, projectId } },
}) {
  return (
    <Dropdown
      overlay={menu({
        projectId, campaignId, resetCampaign, resetAllNominations, openModal
      })}
      className="mrm"
      trigger={['click']}
    >
      <Button>
        <Icon type="tool" />
        <span>Tools</span>
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}
