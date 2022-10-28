import React from 'react'
import { Menu, message } from 'antd'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
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

export interface ActionMenuProps {
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

export const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, assessment, openModal, rescoreResponses, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores,
  exportExternalResults, updateExternalConfig, optionsOverrides,
}) => {
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

  return (
    <Menu>
      <Menu.ItemGroup key="export" title="Export">
        {permissions.exportRawResults && (
          <Menu.Item key="export_raw_labels">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleRawExport(true)}
            >
              {I18n.t('campaign_assessment.actions.export_raw_labels')}
            </div>
          </Menu.Item>
        )}
        {permissions.exportRawResults && (
          <Menu.Item key="export_raw">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleRawExport(false)}
            >
              {I18n.t('campaign_assessment.actions.export_raw_without_labels')}
            </div>
          </Menu.Item>
        )}
        {permissions.exportScoringResults && (
          <Menu.Item key="export_scoring">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleScoringExport()}
            >
              {I18n.t('campaign_assessment.actions.export_scoring')}
            </div>
          </Menu.Item>
        )}
        {permissions.exportNormedResults && (
          <Menu.Item key="export_normed">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleNormedResultExport()}
            >
              {I18n.t('campaign_assessment.actions.export_normed')}
            </div>
          </Menu.Item>
        )}
        {permissions.exportRawFactorScores && (
          <Menu.Item key="export_raw_scores">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleRawFactorExport()}
            >
              {I18n.t('campaign_assessment.actions.export_raw_scores')}
            </div>
          </Menu.Item>
        )}
        {permissions.exportExternalResults && (
          <Menu.Item key="export_external">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => handleExternalResultExport()}
            >
              {I18n.t('campaign_assessment.actions.export_external')}
            </div>
          </Menu.Item>
        )}
      </Menu.ItemGroup>

      {permissions.importResults && (
        <Menu.ItemGroup key="import" title="Import">
          <Menu.Item key="import_raw">
            <a
              onClick={() => openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })}
            >
              {I18n.t('campaign_assessment.actions.import_raw')}
            </a>
          </Menu.Item>
          <Menu.Item key="import_scoring">
            <a
              onClick={() => openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })}
            >
              {I18n.t('campaign_assessment.actions.import_scoring')}
            </a>
          </Menu.Item>
        </Menu.ItemGroup>
      )}

      {permissions.rescoreResponses && (
        <>
          <Menu.Divider />
          <Menu.Item key="rescoring">
            <a
              onClick={handleRescoreResponse}
            >
              {I18n.t('campaign_assessment.modals.rescore_response.title')}
            </a>
          </Menu.Item>
        </>
      )}

      {permissions.remove && actions.remove && (
        <>
          <Menu.Divider />
          <Menu.Item key="remove">
            <div
              role="button"
              tabIndex={-1}
              onClick={() => openModal('RemoveAssessmentModal', { assessment, campaignId, campaignAssessmentId: id })}
            >
              {I18n.t('common.actions.remove')}
            </div>
          </Menu.Item>
        </>
      )}


      {permissions.updateExternalConfig && actions.updateExternalConfig && (
        <>
          <Menu.Item key="updateExternalConfig">
            <a
              onClick={() => {
                openModal('UpdateExternalConfigModal', { campaignId, assessment, updateExternalConfig })
              }}
            >
              {I18n.t('campaign_assessment.modals.update_external_config.title')}
            </a>
          </Menu.Item>
          <Menu.Divider />
        </>
      )}
    </Menu>
  )
}
