import React from 'react'
import {
  Button, Dropdown, Icon, Menu,
  message,
} from 'antd'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { reset as resetCampaign, resetAllNominations } from 'admin/core/threeSixtyCampaign/actions'


const menu = ({
  projectId, campaignId, resetCampaign, resetAllNominations,
}) => {

  const resetCampaignWithMessage = (campaignId) => {
    message.success('Campaign reset is in progress. It will take some time to complete.')
    resetCampaign(campaignId)
  }


  return (
    <Menu>
      <Menu.Item key="1">
        <a href={`/administration/clients/${projectId}/datasheet_rows`}>Manage Data Sheets...</a>
      </Menu.Item>
      <Menu.Item key="2">Manage Relationships...</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">Download Participant List to CSV</Menu.Item>
      <Menu.Item key="4">Download All Reports...</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="5">
        <div onClick={() => resetCampaignWithMessage(campaignId)} role="button" tabIndex={-1}>
          Reset All Participants...
        </div>
      </Menu.Item>
      <Menu.Item key="6">
        <div onClick={() => resetAllNominations(campaignId)} role="button" tabIndex={-1}>Reset All Nominations...</div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="7">View Prepaid Info...</Menu.Item>
      <Menu.Divider />

      <Menu.Item key="8">Manage Previous Jobs...</Menu.Item>
    </Menu>
  )
}

function ToolsDropdown ({
  projectId, resetCampaign, resetAllNominations, match: { params: { campaignId } },
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

export default connect(
  null,
  { resetCampaign, resetAllNominations },
)(withRouter(ToolsDropdown))
