import { MenuProps } from 'antd'
import { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { MenuItem } from '~/interfaces/Antd'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { Props as AssessmentListProps } from './AssessmentList'

const { I18n } = window

interface Options {
  remove: boolean,
  updateExternalConfig: boolean
}

const DEFAULT_OPTIONS = {
  remove: true,
  updateExternalConfig: true,
}
export interface ActionMenuData {
  projectId?: number
  campaignId: number
  assessment: Assessment
  message: MessageInstance
  modal: Omit<ModalStaticFunctions, 'warn'>
  optionsOverrides?: Partial<Options>
  openModal(name: string, data?: {
    ids?: [number, number],
    action?: (
      (campaignId: number, assessmentId: number, body?: object) => Promise<{ response: unknown }>
    ) | (
      (aiRescore?: boolean) => void
    ),
    body?: object,
    onSuccess?: () => void,
    name?: string,
    projectId?: number, assessment?: Assessment, update?: Assessment,
    updateExternalConfig?: AssessmentListProps['updateExternalConfig'],
    campaignId?: number, campaignAssessmentId?: number
  }): void
  rescoreResponses(aiRescore?: boolean): void
  regenerateTranscriptions?: () => void
  exportRawResults: AssessmentListProps['exportRawResults']
  exportScoringResults: AssessmentListProps['exportScoringResults']
  exportNormedResults: AssessmentListProps['exportNormedResults']
  exportRawFactorScores: AssessmentListProps['exportRawFactorScores']
  exportOccupations?: AssessmentListProps['exportOccupations']
  normalizeFactorScores?: AssessmentListProps['normalizeFactorScores']
  exportExternalResults: AssessmentListProps['exportExternalResults']
  updateExternalConfig?: AssessmentListProps['updateExternalConfig']
}

export const getActionsMenuProps = ({
  projectId, campaignId, assessment, openModal, rescoreResponses, regenerateTranscriptions, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores, normalizeFactorScores,
  exportExternalResults, updateExternalConfig, optionsOverrides, message, modal, exportOccupations,
}:ActionMenuData): MenuProps => {
  const { id, name, permissions } = assessment
  const actions = { ...DEFAULT_OPTIONS, ...optionsOverrides || {} }

  const handleRescoreResponse = () => {
    if (permissions.rescoreAiResponses) {
      openModal('RescoreResponseModal', {
        name,
        action: (allowAiRescore = false) => {
          rescoreResponses(allowAiRescore)
          message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
        },
      })
    } else {
      rescoreResponses()
      message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
    }
  }

  const handleRawExport = (with_labels: boolean) => {
    openModal('UserFilterModal', {
      ids: [campaignId, id],
      action: exportRawResults,
      body: { with_labels },
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.raw_results_export_scheduled')) },
    })
  }

  const handleScoringExport = () => {
    openModal('UserFilterModal', {
      ids: [campaignId, id],
      action: exportScoringResults,
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.scoring_results_export_scheduled')) },
    })
  }

  const handleNormedResultExport = () => {
    openModal('UserFilterModal', {
      ids: [campaignId, id],
      action: exportNormedResults,
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.norm_results_export_scheduled')) },
    })
  }

  const handleExportOccupations = () => {
    exportOccupations && exportOccupations(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.export_occupations_job_scheduled'))
    })
  }

  const handleRawFactorExport = () => {
    openModal('UserFilterModal', {
      ids: [campaignId, id],
      action: exportRawFactorScores,
      onSuccess: () => { message.success(I18n.t('campaign_assessment.messages.raw_factor_export_scheduled')) },
    })
  }

  const handleExternalResultExport = () => {
    exportExternalResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.external_results_export_scheduled'))
    })
  }

  const handleNormalizeFactorScores = () => {
    if (normalizeFactorScores) {
      normalizeFactorScores(campaignId, id).then(() => {
        message.success(I18n.t('campaign_assessment.messages.normalize_factor_scores_scheduled'))
      })
    }
  }

  const handleRegenerateTranscriptions = () => {
    if (regenerateTranscriptions) {
      modal.confirm({
        title: I18n.t('admin.regenerate_transcriptions_confirm_title'),
        content: I18n.t('admin.regenerate_transcriptions_confirm_content'),
        okText: I18n.t('common.text.confirm'),
        cancelText: I18n.t('common.text.cancel'),
        onOk: () => {
          regenerateTranscriptions()
          message.success(I18n.t('admin.regenerate_transcriptions_scheduled'))
        },
      })
    }
  }

  const exportGroupItems: MenuItem[] = []
  permissions.exportOccupations && exportGroupItems.push({
    key: 'export_occupations',
    label: I18n.t('campaign_assessment.actions.export_occupations'),
  })
  permissions.exportRawResults && exportGroupItems.push({
    key: 'export_raw_labels',
    label: I18n.t('campaign_assessment.actions.export_raw_labels'),
  })
  permissions.exportRawResults && exportGroupItems.push({
    key: 'export_raw',
    label: I18n.t('campaign_assessment.actions.export_raw_without_labels'),
  })
  permissions.exportScoringResults && exportGroupItems.push({
    key: 'export_scoring',
    label: I18n.t('campaign_assessment.actions.export_scoring'),
  })
  permissions.exportNormedResults && exportGroupItems.push({
    key: 'export_normed',
    label: I18n.t('campaign_assessment.actions.export_normed'),
  })
  permissions.exportRawFactorScores && exportGroupItems.push({
    key: 'export_raw_scores',
    label: I18n.t('campaign_assessment.actions.export_raw_scores'),
  })
  permissions.exportExternalResults && exportGroupItems.push({
    key: 'export_external',
    label: I18n.t('campaign_assessment.actions.export_external'),
  })

  const importGroupItems: MenuItem[] = [
    { key: 'import_raw', label: I18n.t('campaign_assessment.actions.import_raw') },
    { key: 'import_scoring', label: I18n.t('campaign_assessment.actions.import_scoring') },
    { key: 'import_external_scoring', label: I18n.t('admin.import_external_scoring_action') },
  ]

  const rescoreMenuItems:MenuItem[] = [
    { type: 'divider', key: 'rescore_divider' },
    { key: 'rescoring', label: I18n.t('campaign_assessment.modals.rescore_response.title') },
  ]

  const regenerateTranscriptionItems:MenuItem[] = [
    { key: 'regenerate_transcriptions', label: I18n.t('admin.regenerate_transcriptions_action') },
  ]

  const removeMenuItems:MenuItem[] = [
    { key: 'remove', label: I18n.t('common.actions.remove') },
  ]

  const configMenuItems:MenuItem[] = [
    { key: 'updateExternalConfig', label: I18n.t('campaign_assessment.modals.update_external_config.title') },
    { type: 'divider' },
  ]


  const menuItems: MenuItem[] = [{
    type: 'group', key: 'export', label: I18n.t('common.actions.export'), children: exportGroupItems,
  }]
  permissions.importResults && menuItems.push({
    type: 'group',
    key: 'import',
    label: I18n.t('common.actions.import'),
    children: importGroupItems,
  })
  permissions.rescoreResponses && menuItems.push(...rescoreMenuItems)
  permissions.regenerateTranscriptions && menuItems.push(...regenerateTranscriptionItems)
  permissions.updateExternalConfig && actions.updateExternalConfig && menuItems.push(...configMenuItems)
  permissions.scheduleAssessment && menuItems.push({ key: 'schedule', label: I18n.t('common.actions.schedule') })
  permissions.normalizeFactorScores && menuItems.push(
    { key: 'normalizeFactorScores', label: 'Normalize Factor Scores' },
  )
  permissions.remove && actions.remove && menuItems.push(...removeMenuItems)

  const handleMenuClick = ({ key }) => {
    if (key === 'export_raw_labels') {
      return handleRawExport(true)
    }
    if (key === 'export_raw') {
      return handleRawExport(false)
    }
    if (key === 'export_scoring') {
      return handleScoringExport()
    }
    if (key === 'export_normed') {
      return handleNormedResultExport()
    }
    if (key === 'export_raw_scores') {
      return handleRawFactorExport()
    }
    if (key === 'export_external') {
      return handleExternalResultExport()
    }
    if (key === 'export_occupations') {
      return handleExportOccupations()
    }
    if (key === 'import_raw') {
      return openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'import_scoring') {
      return openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'import_external_scoring') {
      return openModal('ImportExternalScoringModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'rescoring') {
      return handleRescoreResponse()
    }
    if (key === 'regenerate_transcriptions') {
      return handleRegenerateTranscriptions()
    }
    if (key === 'remove') {
      return openModal('RemoveAssessmentModal', { assessment, campaignId, campaignAssessmentId: id })
    }
    if (key === 'updateExternalConfig') {
      return openModal('UpdateExternalConfigModal', { campaignId, assessment, updateExternalConfig })
    }
    if (key === 'schedule') {
      return openModal('SchedulingCampaignAssessmentModal', { projectId, campaignId, assessment })
    }
    if (key === 'normalizeFactorScores') {
      return handleNormalizeFactorScores()
    }
  }

  return (
    { items: menuItems, onClick: handleMenuClick }
  )
}
