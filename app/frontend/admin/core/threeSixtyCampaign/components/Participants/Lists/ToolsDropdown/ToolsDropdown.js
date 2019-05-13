import React from 'react'
import {
  Button, Dropdown, Icon, Menu,
  message,
} from 'antd'

const menu = ({
  projectId, campaignId, resetCampaign, resetAllNominations,
}) => {
  const resetCampaignWithMessage = (campaignId) => {
    message.success('Campaign reset is in progress. It will take some time to complete.')
    resetCampaign(campaignId)
  }

  const resetAllNominationsWithMessage = (campaignId) => {
    message.success('Nominations reset is in progress. It will take some time to complete.')
    resetAllNominations(campaignId)
  }


  return (
    <Menu>
      <Menu.Item key="1">
        <a href={`/administration/clients/${projectId}/datasheet_rows`}>Manage Data Sheets...</a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="5">
        <div onClick={() => resetCampaignWithMessage(campaignId)} role="button" tabIndex={-1}>
          Reset All Participants...
        </div>
      </Menu.Item>
      <Menu.Item key="6">
        <div
          onClick={() => resetAllNominationsWithMessage(campaignId)}
          role="button"
          tabIndex={-1}
        >
          Reset All Nominations...
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, match: { params: { campaignId, projectId } },
}) {
  return (
    <Dropdown
      overlay={menu({
        projectId, campaignId, resetCampaign, resetAllNominations,
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
