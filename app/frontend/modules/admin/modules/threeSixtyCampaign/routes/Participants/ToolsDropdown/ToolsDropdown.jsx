import {
  Button, App,
} from 'antd'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const getCustomMenuProps = ({
  threesixtyCampaignId, campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  permissions, onExport, handleRescoreAssessment, regenerateReports, handleExportRawResults,
  handleExportThreeSixtyScores, handleBulkDownloads, openModal, isBulk, handleBulkMarkAsDone,
  selectedKeys, excludedKeys, isAllSelected,
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
      return openModal('ImportRawModal', { campaignId: threesixtyCampaignId })
    }
    if (key === 'reset_participant') {
      return resetCampaignWithConfirmation(threesixtyCampaignId)
    }
    if (key === 'reset_all_nominations') {
      return resetAllNominationsWithConfirmation(threesixtyCampaignId)
    }
    if (key === 'rescore_assessment') {
      return handleRescoreAssessment(threesixtyCampaignId)
    }
    if (key === 'regenerate_reports') {
      return regenerateReports(threesixtyCampaignId)
    }
    if (key === 'export_360_scores') {
      return handleExportThreeSixtyScores(threesixtyCampaignId)
    }
    if (key === 'bulk_downloads') {
      return handleBulkDownloads(threesixtyCampaignId)
    }
    if (key === 'completed' || key === 'in_progress') {
      return handleBulkMarkAsDone(campaignId, key, isAllSelected, selectedKeys, excludedKeys)
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

  const bulkActionItems = [
    permissions.bulkUpdateEvaluationStatus && {
      key: 'completed',
      label: I18n.t('campaign_assessment.actions.bulk_update_evaluation_as_done'),
    },
    permissions.bulkUpdateEvaluationStatus && {
      key: 'in_progress',
      label: I18n.t('campaign_assessment.actions.bulk_update_evaluation_as_undone'),
    },
  ]

  return { items: isBulk ? bulkActionItems : menuItems, onClick: handleMenuClick }
}

export default function ToolsDropdown ({
  threesixtyCampaignId, campaignId, dimensionId, resetCampaign, resetAllNominations, openModal,
  rescoreAssessment, permissions,
  exportCompletionStatuses, regenerateReports, exportRawResults, exportThreeSixtyScores, bulkDownloads,
  reportAvailableLanguages, reportDefaultLanguage, isBulk, markAsDone, selectedKeys, excludedKeys, title, isAllSelected,
}) {
  const { projectId } = useParams()
  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('ResetCampaignModal', {
      onConfirm: removeLicenceUsage => resetCampaign(campaignId, removeLicenceUsage),
    })
  }
  const { modal, message } = App.useApp()

  const handleRescoreAssessment = (threesixtyCampaignId) => {
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
          await rescoreAssessment(threesixtyCampaignId)
          message.success(I18n.t('campaign_assessment.modals.rescore.successfully'))
        } catch (error) {
          message.error(error, 5)
        }
      },
    })
  }

  const handleRegenerateReports = (threesixtyCampaignId) => {
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
            await regenerateReports(threesixtyCampaignId, [reportDefaultLanguage], true)
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
            await regenerateReports(threesixtyCampaignId, selectedLocales, forceRegenerate)
            message.success(I18n.t('user_reports.messages.regenerate_successful'))
          } catch (error) {
            message.error(error, 5)
          }
        },
      })
    }
  }

  const handleBulkDownloads = () => {
    if (reportAvailableLanguages.length === 0) {
      bulkDownloads(threesixtyCampaignId, [reportDefaultLanguage])
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
          bulkDownloads(threesixtyCampaignId, selectedLocales)
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

  const handleBulkMarkAsDone = (threesixtyCampaignId, status_key, isAllSelected, selectedKeys, excludedKeys) => {
    const status = status_key === 'completed' ? 'done' : 'undone'

    modal.confirm({
      title: I18n.t('campaign_assessment.modals.bulk_update_evaluation.title', { status }),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.bulk_update_evaluation.content', { status }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: async () => {
        try {
          await markAsDone(threesixtyCampaignId, status_key, isAllSelected, selectedKeys, excludedKeys)
          message.success(
            I18n.t('campaign_assessment.modals.bulk_update_evaluation.successfully', { status }),
          )
        } catch (error) {
          message.error(error, 5)
        }
      },
    })
  }


  const resetAllNominationsWithConfirmation = (threesixtyCampaignId) => {
    openModal('CampaignNameConfirmationModal', {
      onConfirm: () => resetAllNominations(threesixtyCampaignId),
      confirmationMessage: I18n.t('threesixty.reset_nomination_confirmation'),
    })
  }

  const onExport = () => {
    exportCompletionStatuses(threesixtyCampaignId).then(() => {
      message.success(I18n.t('jobs.threesixty.export_completion_statuses_scheduled'))
    })
  }

  const handleExportRawResults = (withLabels) => {
    exportRawResults(threesixtyCampaignId, withLabels).then(() => {
      message.success(I18n.t('jobs.threesixty.export_raw_results_scheduled'))
    })
  }

  const handleExportThreeSixtyScores = () => {
    exportThreeSixtyScores(threesixtyCampaignId).then(() => {
      message.success(I18n.t('jobs.threesixty.export_scores_scheduled'))
    })
  }

  return (
    <ConditionalDropdown
      menu={
        getCustomMenuProps({
          projectId,
          threesixtyCampaignId,
          dimensionId,
          campaignId,
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
          handleBulkMarkAsDone,
          isBulk,
          selectedKeys,
          excludedKeys,
          isAllSelected,
        })
      }
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>{title || 'Tools'}</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}
