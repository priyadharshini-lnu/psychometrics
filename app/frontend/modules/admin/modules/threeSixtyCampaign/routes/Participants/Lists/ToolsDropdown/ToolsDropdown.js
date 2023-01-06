import React from 'react'
import {
  Button, Menu, message, Modal,
} from 'antd'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'

const CustomMenu = ({
  campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  permissions, onExport, handleRescoreAssessment,
}) => {
  const handleMenuClick = ({ key }) => {
    if (key === 'export_completion_status') {
      return onExport()
    }
    if (key === 'reset_participant') {
      return resetCampaignWithConfirmation(campaignId)
    }
    if (key === 'reset_all_nominations') {
      return resetAllNominationsWithConfirmation(campaignId)
    }
    if (key === 'rescore_assessment') {
      return handleRescoreAssessment(campaignId)
    }
  }

  const menuItems = [
    permissions.exportResults && {
      key: 'export_result',
      label: (
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/export_results.xlsx`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {I18n.t('campaign_assessment.actions.export_result')}
        </a>),
    },
    permissions.exportCompletionStatus && {
      key: 'export_completion_status',
      label: I18n.t('campaign_assessment.actions.export_completion_status'),
    },
    { type: 'divider' },
    permissions.resetAllParticipants && {
      key: 'reset_participant',
      label: I18n.t('campaign_assessment.actions.reset_participant'),
    },
    permissions.resetAllNominations && {
      key: 'reset_all_nominations',
      label: I18n.t('campaign_assessment.actions.reset_all_nominations'),
    },
    permissions.rescoreAssessment && {
      key: 'rescore_assessment',
      label: I18n.t('campaign_assessment.actions.rescore'),
    },
  ]
  return (
    <Menu onClick={handleMenuClick} items={menuItems} />
  )
}

export default function ToolsDropdown ({
  resetCampaign, resetAllNominations, openModal, rescoreAssessment,
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
      menu={
        CustomMenu({
          projectId,
          campaignId,
          resetCampaignWithConfirmation,
          resetAllNominationsWithConfirmation,
          handleRescoreAssessment,
          openModal,
          permissions,
          onExport,
        })
      }
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
