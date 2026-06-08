import {
  Button, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ToolOutlined, DownOutlined, ExclamationCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { updateCampaignAssessmentDetails } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignAssessments'

const getCustomMenuProps = ({
  campaignId, resetCampaignWithConfirmation, resetAllNominationsWithConfirmation,
  permissions, onExport, handleRescoreAssessment, regenerateReports, handleExportRawResults,
  handleExportThreeSixtyScores, handleBulkDownloads, openModal, isBulk, handleBulkMarkAsDone,
  selectedKeys, excludedKeys, isAllSelected, handleTemplateConversion, handleToggleCaching, cachingEnabled,
  allowCaching,
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
    if (key === 'completed' || key === 'in_progress') {
      return handleBulkMarkAsDone(campaignId, key, isAllSelected, selectedKeys, excludedKeys)
    }
    if (key === 'convert_to_template') {
      return handleTemplateConversion()
    }
    if (key === 'enable_caching') {
      return handleToggleCaching(campaignId, true)
    }
    if (key === 'disable_caching') {
      return handleToggleCaching(campaignId, false)
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
      label: I18n.t('shared.export'),
      children: exportGroupItems,
    },
    importGroupItems.length && {
      type: 'group',
      key: 'import',
      label: I18n.t('shared.import'),
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
    permissions.convertToTemplate && {
      key: 'convert_to_template',
      label: I18n.t('campaign_assessment.actions.convert_to_template'),
    },
    permissions.toggleCaching && !cachingEnabled && allowCaching && {
      key: 'enable_caching',
      label: I18n.t('admin.campaign_assessment_actions_enable_caching'),
    },
    permissions.toggleCaching && cachingEnabled && allowCaching && {
      key: 'disable_caching',
      label: I18n.t('admin.campaign_assessment_actions_disable_caching'),
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
  campaignId, dimensionId, resetCampaign, resetAllNominations, openModal,
  rescoreAssessment, permissions,
  exportCompletionStatuses, regenerateReports, exportRawResults, exportThreeSixtyScores, bulkDownloads,
  reportAvailableLanguages, reportDefaultLanguage, isBulk, markAsDone, selectedKeys,
  excludedKeys, title, isAllSelected, toggleCaching, cachingEnabled, allowCaching,
}) {
  const { projectId } = useParams()

  const resetCampaignWithConfirmation = (campaignId) => {
    openModal('ResetCampaignModal', {
      onConfirm: removeLicenceUsage => resetCampaign(campaignId, removeLicenceUsage),
    })
  }
  const { modal, message } = App.useApp()
  const dispatch = useDispatch()


  const handleTemplateConversion = () => {
    openModal('ConvertOrCopyAsTemplateModal', {
      visible: true,
      campaignId,
      projectId,
    })
  }

  const handleRescoreAssessment = (campaignId) => {
    modal.confirm({
      title: I18n.t('campaign_assessment.modals.rescore.title'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.rescore.content'),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
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
    if (!isAllSelected && (!selectedKeys || selectedKeys.length === 0)) {
      message.warning(I18n.t('campaign_assessment.messages.no_participants_selected'), 5)
      return
    }

    if (reportAvailableLanguages.length === 0) {
      modal.confirm({
        title: I18n.t('campaign_assessment.modals.regenerate.title'),
        icon: <ExclamationCircleOutlined />,
        centered: true,
        width: 650,
        content: I18n.t('campaign_assessment.modals.regenerate.content'),
        okText: I18n.t('shared.ok'),
        cancelText: I18n.t('shared.cancel'),
        onOk: async () => {
          try {
            await regenerateReports(
              campaignId, [reportDefaultLanguage], true, isAllSelected, selectedKeys, excludedKeys,
            )
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
            await regenerateReports(
              campaignId, selectedLocales, forceRegenerate, isAllSelected, selectedKeys, excludedKeys,
            )
            message.success(I18n.t('user_reports.messages.regenerate_successful'))
          } catch (error) {
            message.error(error, 5)
          }
        },
      })
    }
  }

  const handleBulkDownloads = () => {
    if (!isAllSelected && (!selectedKeys || selectedKeys.length === 0)) {
      message.warning(I18n.t('campaign_assessment.messages.no_participants_selected'), 5)
      return
    }

    if (reportAvailableLanguages.length === 0) {
      bulkDownloads(campaignId, [reportDefaultLanguage], isAllSelected, selectedKeys, excludedKeys)
        .then(() => {
          message.success(I18n.t('jobs.threesixty.bulk_downloads'))
        })
        .catch((error) => {
          message.error(error)
        })
    } else {
      openModal('BulkDownloadModal', {
        visible: true,
        onClose: () => {
        },
        allLocales: reportAvailableLanguages,
        defaultLocale: reportDefaultLanguage,
        onConfirm: (selectedLocales) => {
          bulkDownloads(campaignId, selectedLocales, isAllSelected, selectedKeys, excludedKeys)
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

  const handleBulkMarkAsDone = (campaignId, status_key, isAllSelected, selectedKeys, excludedKeys) => {
    const status = status_key === 'completed' ? 'done' : 'undone'

    modal.confirm({
      title: I18n.t('campaign_assessment.modals.bulk_update_evaluation.title', { status }),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.bulk_update_evaluation.content', { status }),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        try {
          await markAsDone(campaignId, status_key, isAllSelected, selectedKeys, excludedKeys)
          message.success(
            I18n.t('campaign_assessment.modals.bulk_update_evaluation.successfully', { status }),
          )
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

  const handleToggleCaching = (campaignId, cachingEnabled) => {
    const toggle_type = cachingEnabled ? 'enable_caching' : 'disable_caching'
    modal.confirm({
      title: I18n.t(`admin.${toggle_type}_title`),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t(`admin.${toggle_type}_content`),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t('shared.cancel'),
      onOk: async () => {
        try {
          await toggleCaching(campaignId, cachingEnabled)
          message.success(I18n.t(`admin.${toggle_type}_successfully`))
          dispatch(updateCampaignAssessmentDetails({ cachingEnabled }))
        } catch (error) {
          message.error(error, 5)
        }
      },
    })
  }

  return (
    <ConditionalDropdown
      menu={
        getCustomMenuProps({
          projectId,
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
          handleTemplateConversion,
          handleToggleCaching,
          isBulk,
          selectedKeys,
          excludedKeys,
          isAllSelected,
          cachingEnabled,
          allowCaching,
        })
      }
      className="mrm"
      hideForEmptyMenu
      innerElement={(
        <Button>
          <ToolOutlined />
          <span>{title || I18n.t('admin.tools')}</span>
          <DownOutlined />
        </Button>
      )}
    />
  )
}
