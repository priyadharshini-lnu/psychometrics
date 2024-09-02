import {
  Button, App,
} from 'antd'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const getCustomMenuProps = ({
  campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  permissions, onExport, handleRescoreAssessment, regenerateReports, handleExportRawResults,
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
    if (key === 'regenerate_reports') {
      return regenerateReports(campaignId)
    }
    if (key === 'export_result') {
      return handleExportRawResults(campaignId)
    }
  }

  const menuItems = [
    permissions.exportResults && {
      key: 'export_result',
      label: I18n.t('campaign_assessment.actions.export_result'),
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
    permissions.bulkRegenerateReports && {
      key: 'regenerate_reports',
      label: I18n.t('campaign_assessment.actions.regenerate'),
    },
  ]
  return { items: menuItems, onClick: handleMenuClick }
}

export default function ToolsDropdown ({
  dimensionId, resetCampaign, resetAllNominations, openModal, rescoreAssessment,
  match: { params: { campaignId, projectId } }, permissions,
  exportCompletionStatuses, regenerateReports, exportRawResults,
}) {
  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('ResetCampaignModal', {
      onConfirm: removeLicenceUsage => resetCampaign(campaignId, removeLicenceUsage),
    })
  }
  const { modal, message } = App.useApp()

  const handleRescoreAssessment = (campaignId) => {
    modal.confirm({
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


  const handleRegenerateReports = (campaignId) => {
    modal.confirm({
      title: I18n.t('campaign_assessment.modals.regenerate.title'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.regenerate.content'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: async () => {
        try {
          await regenerateReports(campaignId)
          message.success(I18n.t('user_reports.messages.regenerate_successful'))
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

  const handleExportRawResults = () => {
    exportRawResults(campaignId).then(() => {
      message.success(I18n.t('jobs.threesixty.export_raw_results_scheduled'))
    })
  }

  return (
    <ConditionalDropdown
      menu={
        getCustomMenuProps({
          projectId,
          campaignId,
          dimensionId,
          resetCampaignWithConfirmation,
          resetAllNominationsWithConfirmation,
          handleRescoreAssessment,
          regenerateReports: handleRegenerateReports,
          openModal,
          permissions,
          onExport,
          handleExportRawResults,
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
