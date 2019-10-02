import React from 'react'
import {
  Button, Dropdown, Icon, Menu,
} from 'antd'

const menu = ({
  projectId, campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation, openModal, dimensionId,
}) => (
  <Menu>
    <Menu.Item key="1">
      <a href={`/administration/clients/${projectId}/datasheet_rows`}>Manage Data Sheets...</a>
    </Menu.Item>
    <Menu.Item key="2">
      <a onClick={() => openModal('ManageRelationshipsModal')} role="button" tabIndex={-1}>Manage Relationships...</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="4">
      <a href={`/administration/threesixty_campaigns/${campaignId}/export_completion_status.xlsx`} download>
        Export Completion Status
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="dimension">
      <a href={`/administration/dimensions/${dimensionId}/factors`} role="button" tabIndex={-1}>
        Edit Dimension
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="5">
      <div onClick={() => resetCampaignWithConfirmation(campaignId)} role="button" tabIndex={-1}>
        Reset All Participants...
      </div>
    </Menu.Item>
    <Menu.Item key="6">
      <div
        onClick={() => resetAllNominationsWithConfirmation(campaignId)}
        role="button"
        tabIndex={-1}
      >
        Reset All Nominations...
      </div>
    </Menu.Item>
  </Menu>
)

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, openModal, dimensionId,
  match: { params: { campaignId, projectId } },
}) {
  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('CampaignNameConfirmationModal', {
      onConfirm: () => resetCampaign(campaignId),
      confirmationMessage: I18n.t('threesixty.reset_campaign_confirmation'),
    })
  }

  const resetAllNominationsWithConfirmation = (campaignId) => {
    openModal('CampaignNameConfirmationModal', {
      onConfirm: () => resetAllNominations(campaignId),
      confirmationMessage: I18n.t('threesixty.reset_nomination_confirmation'),
    })
  }

  return (
    <Dropdown
      overlay={menu({
        projectId,
        campaignId,
        resetCampaignWithConfirmation,
        resetAllNominationsWithConfirmation,
        openModal,
        dimensionId,
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
