import {
  Button, App,
} from 'antd'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const getCustomMenuProps = ({
  campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  permissions, onExport, handleRescoreAssessment, regenerateReports, handleExportRawResults,
  handleExportThreeSixtyScores, handleBulkDownloads, openModal,
}) => {
  const handleMenuClick = ({ key }) => {
    if (key === 'export_raw_labels') {
      return handleExportRawResults(true)
    }
    if (key === 'export_raw') {
      return handleExportRawResults(false)
    }
    if (key === 'export_completion_status') {
      return onExport()
    }
    if (key === 'import_raw') {
      return openModal('ImportRawModal', { campaignId })
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
    if (key === 'export_360_scores') {
      return handleExportThreeSixtyScores(campaignId)
    }
    if (key === 'bulk_downloads') {
      return handleBulkDownloads(campaignId)
    }
  }

  const exportGroupItems = [
    permissions.exportResults && {
      key: 'export_raw_labels',
      label: I18n.t('campaign_assessment.actions.export_raw_labels'),
    },
    permissions.exportResults && {
      key: 'export_raw',
      label: I18n.t('campaign_assessment.actions.export_raw_without_labels'),
    },
    permissions.exportCompletionStatus && {
      key: 'export_completion_status',
      label: I18n.t('campaign_assessment.actions.export_completion_status'),
    },
    permissions.exportThreesixtyScores && {
      key: 'export_360_scores',
      label: I18n.t('campaign_assessment.actions.export_scores'),
    },
  ]

  const importGroupItems = [
    permissions.importResults && { key: 'import_raw', label: I18n.t('campaign_assessment.actions.import_raw') },
  ]


  const menuItems = [
    {
      type: 'group',
      key: 'export',
      label: I18n.t('common.actions.export'),
      children: exportGroupItems,
    },
    importGroupItems.length && {
      type: 'group',
      key: 'import',
      label: I18n.t('common.actions.import'),
      children: importGroupItems,
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
    permissions.bulkDownload && {
      key: 'bulk_downloads',
      label: I18n.t('campaign_assessment.actions.bulk_download'),
    },
  ]
  return { items: menuItems, onClick: handleMenuClick }
}

export default function ToolsDropdown ({
  dimensionId, resetCampaign, resetAllNominations, openModal, rescoreAssessment, permissions,
  exportCompletionStatuses, regenerateReports, exportRawResults, exportThreeSixtyScores, bulkDownloads,
  reportAvailableLanguages, reportDefaultLanguage,
}) {
  const { projectId, campaignId } = useParams()
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
    if (reportAvailableLanguages.length === 0) {
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
            await regenerateReports(campaignId, [reportDefaultLanguage], true)
            message.success(I18n.t('user_reports.messages.regenerate_successful'))
          } catch (error) {
            message.error(error, 5)
          }
        },
      })
    } else {
      openModal('RegenerateReportModal', {
        visible: true,
        onClose: () => {},
        allLocales: reportAvailableLanguages,
        defaultLocale: reportDefaultLanguage,
        onConfirm: async (selectedLocales, forceRegenerate) => {
          try {
            await regenerateReports(campaignId, selectedLocales, forceRegenerate)
            message.success(I18n.t('campaign_assessment.modals.regenerate.successfully'))
          } catch (error) {
            message.error(error, 5)
          }
        },
      })
    }
  }

  const handleBulkDownloads = () => {
    if (reportAvailableLanguages.length === 0) {
      bulkDownloads(campaignId, [reportDefaultLanguage])
        .then(() => {
          message.success(I18n.t('jobs.threesixty.bulk_downloads'))
        })
        .catch((error) => {
          message.error(error)
        })
    } else {
      openModal('BulkDownloadModal', {
        visible: true,
        onClose: () => {},
        allLocales: reportAvailableLanguages,
        defaultLocale: reportDefaultLanguage,
        onConfirm: (selectedLocales) => {
          bulkDownloads(campaignId, selectedLocales)
            .then(() => {
              message.success(I18n.t('jobs.threesixty.bulk_downloads'))
            })
            .catch((error) => {
              message.error(error)
            })
        },
      })
    }
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

  const handleExportRawResults = (withLabels) => {
    exportRawResults(campaignId, withLabels).then(() => {
      message.success(I18n.t('jobs.threesixty.export_raw_results_scheduled'))
    })
  }

  const handleExportThreeSixtyScores = () => {
    exportThreeSixtyScores(campaignId).then(() => {
      message.success(I18n.t('jobs.threesixty.export_scores_scheduled'))
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
          handleExportThreeSixtyScores,
          handleBulkDownloads,
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
