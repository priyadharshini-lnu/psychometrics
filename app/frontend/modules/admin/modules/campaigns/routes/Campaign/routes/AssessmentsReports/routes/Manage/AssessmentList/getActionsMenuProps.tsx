import { MenuProps, message } from 'antd'
import { MenuItemType } from 'rc-menu/lib/interface'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
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
  campaignId: number
  assessment: Assessment
  optionsOverrides?: Partial<Options>
  openModal(name: string, data?: {
    projectId?: number, assessment?: Assessment, update?: Assessment,
    updateExternalConfig?: AssessmentListProps['updateExternalConfig'],
    campaignId: number, campaignAssessmentId?: number
  }): void
  rescoreResponses(): void
  exportRawResults: AssessmentListProps['exportRawResults']
  exportScoringResults: AssessmentListProps['exportScoringResults']
  exportNormedResults: AssessmentListProps['exportNormedResults']
  exportRawFactorScores: AssessmentListProps['exportRawFactorScores']
  exportExternalResults: AssessmentListProps['exportExternalResults']
  updateExternalConfig?: AssessmentListProps['updateExternalConfig']
}

export const getActionsMenuProps = ({
  campaignId, assessment, openModal, rescoreResponses, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores,
  exportExternalResults, updateExternalConfig, optionsOverrides,
}:ActionMenuData): MenuProps => {
  const { id, name, permissions } = assessment
  const actions = { ...DEFAULT_OPTIONS, ...optionsOverrides || {} }

  const handleRescoreResponse = () => {
    rescoreResponses()
    message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
  }

  const handleRawExport = (with_labels: boolean) => {
    exportRawResults(campaignId, id, with_labels).then(() => {
      message.success(I18n.t('campaign_assessment.messages.raw_results_export_scheduled'))
    })
  }

  const handleScoringExport = () => {
    exportScoringResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.scoring_results_export_scheduled'))
    })
  }

  const handleNormedResultExport = () => {
    exportNormedResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.norm_results_export_scheduled'))
    })
  }

  const handleRawFactorExport = () => {
    exportRawFactorScores(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.raw_factor_export_scheduled'))
    })
  }

  const handleExternalResultExport = () => {
    exportExternalResults(campaignId, id).then(() => {
      message.success(I18n.t('campaign_assessment.messages.external_results_export_scheduled'))
    })
  }

  const exportGroupItems: MenuItemType[] = []
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

  const importGroupItems: MenuItemType[] = [
    { key: 'import_raw', label: I18n.t('campaign_assessment.actions.import_raw') },
    { key: 'import_scoring', label: I18n.t('campaign_assessment.actions.import_scoring') },
  ]

  const rescoreMenuItems:ItemType[] = [
    { type: 'divider', key: 'rescore_divider' },
    { key: 'rescoring', label: I18n.t('campaign_assessment.modals.rescore_response.title') },
  ]

  const removeMenuItems:ItemType[] = [
    { type: 'divider' },
    { key: 'remove', label: I18n.t('common.actions.remove') },
  ]

  const configMenuItems:ItemType[] = [
    { key: 'updateExternalConfig', label: I18n.t('campaign_assessment.modals.update_external_config.title') },
    { type: 'divider' },
  ]


  const menuItems: ItemType[] = [{
    type: 'group', key: 'export', label: 'Export', children: exportGroupItems,
  }]
  permissions.importResults && menuItems.push({
    type: 'group',
    key: 'import',
    label: 'Import',
    children: importGroupItems,
  })
  permissions.rescoreResponses && menuItems.push(...rescoreMenuItems)
  permissions.remove && actions.remove && menuItems.push(...removeMenuItems)
  permissions.updateExternalConfig && actions.updateExternalConfig && menuItems.push(...configMenuItems)

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
    if (key === 'import_raw') {
      return openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'import_scoring') {
      return openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })
    }
    if (key === 'rescoring') {
      return handleRescoreResponse()
    }
    if (key === 'remove') {
      return openModal('RemoveAssessmentModal', { assessment, campaignId, campaignAssessmentId: id })
    }
    if (key === 'updateExternalConfig') {
      return openModal('UpdateExternalConfigModal', { campaignId, assessment, updateExternalConfig })
    }
  }

  return (
    { items: menuItems, onClick: handleMenuClick }
  )
}
