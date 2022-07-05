import React from 'react'
import {
  Button, Menu, message, Modal,
} from 'antd'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'

const menu = ({
  campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  openModal, dimensionId, permissions, onExport, handleRescoreAssessment,
}) => (
  <Menu>
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
      <Menu.Item key="export_completion_status" onClick={() => onExport()}>
        Export Completion Status
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
    {permissions.rescoreAssessment && (
      <Menu.Item key="rescore_assessment">
        <div
          onClick={() => handleRescoreAssessment(campaignId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('campaign_assessment.actions.rescore')}
        </div>
      </Menu.Item>
    )}
  </Menu>
)

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, openModal, dimensionId, rescoreAssessment,
  match: { params: { campaignId, projectId } }, permissions,
  exportCompletionStatuses,
}) {
  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('ResetCampaignModal', {
      onConfirm: removeLicenceUsage => resetCampaign(campaignId, removeLicenceUsage),
    })
  }

  const handleRescoreAssessment = (campaignId) => {
    Modal.confirm({
      title: I18n.t('campaign_assessment.modals.rescore.title'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.rescore.content'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: async () => {
        try {
          await rescoreAssessment(campaignId)
          message.success(I18n.t('campaign_assessment.modals.rescore.successfully'))
        } catch (error) {
          message.error(error, 5)
        }
      },
    })
  }


  const resetAllNominationsWithConfirmation = (campaignId) => {
    openModal('CampaignNameConfirmationModal', {
      onConfirm: () => resetAllNominations(campaignId),
      confirmationMessage: I18n.t('threesixty.reset_nomination_confirmation'),
    })
  }

  const onExport = () => {
    exportCompletionStatuses(campaignId).then(() => {
      message.success(I18n.t('jobs.threesixty.export_completion_statuses_scheduled'))
    })
  }

  return (
    <ConditionalDropdown
      menu={menu({
        projectId,
        campaignId,
        resetCampaignWithConfirmation,
        resetAllNominationsWithConfirmation,
        handleRescoreAssessment,
        openModal,
        dimensionId,
        permissions,
        onExport,
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
