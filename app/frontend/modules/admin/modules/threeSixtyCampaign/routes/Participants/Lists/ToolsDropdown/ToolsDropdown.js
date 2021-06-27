import React from 'react'
import {
  Button, Menu,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'

const menu = ({
  projectId, campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  openModal, dimensionId, permissions,
}) => (
  <Menu>
    {permissions.manageDatasheets && (
      <Menu.Item key="datasheet">
        <a href={`/administration/clients/${projectId}/datasheet_rows`}>Manage Data Sheets...</a>
      </Menu.Item>
    )}
    {permissions.manageRelationships && (
      <Menu.Item key="manage_relationship">
        <a onClick={() => openModal('ManageRelationshipsModal')} role="button" tabIndex={-1}>Manage Relationships...</a>
      </Menu.Item>
    )}
    <Menu.Divider />
    {permissions.exportResults && (
      <Menu.Item key="export_results">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/export_results.xlsx`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Export Result
        </a>
      </Menu.Item>
    )}
    {permissions.exportCompletionStatus && (
      <Menu.Item key="export_completion_status">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/export_completion_status.xlsx`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Export Completion Status
        </a>
      </Menu.Item>
    )}
    <Menu.Divider />
    {permissions.editDimension && (
      <Menu.Item key="dimension">
        <a href={`/administration/dimensions/${dimensionId}/factors`} role="button" tabIndex={-1}>
          Edit Dimension
        </a>
      </Menu.Item>
    )}
    <Menu.Divider />
    {permissions.resetAllParticipants && (
      <Menu.Item key="reset_participant">
        <div onClick={() => resetCampaignWithConfirmation(campaignId)} role="button" tabIndex={-1}>
          Reset All Participants...
        </div>
      </Menu.Item>
    )}
    {permissions.resetAllNominations && (
      <Menu.Item key="reset_all_nominations">
        <div
          onClick={() => resetAllNominationsWithConfirmation(campaignId)}
          role="button"
          tabIndex={-1}
        >
          Reset All Nominations...
        </div>
      </Menu.Item>
    )}
  </Menu>
)

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, openModal, dimensionId,
  match: { params: { campaignId, projectId } }, permissions,
}) {
  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('ResetCampaignModal', {
      onConfirm: removeLicenceUsage => resetCampaign(campaignId, removeLicenceUsage),
    })
  }

  const resetAllNominationsWithConfirmation = (campaignId) => {
    openModal('CampaignNameConfirmationModal', {
      onConfirm: () => resetAllNominations(campaignId),
      confirmationMessage: I18n.t('threesixty.reset_nomination_confirmation'),
    })
  }

  return (
    <ConditionalDropdown
      menu={menu({
        projectId,
        campaignId,
        resetCampaignWithConfirmation,
        resetAllNominationsWithConfirmation,
        openModal,
        dimensionId,
        permissions,
      })}
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>Tools</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}
