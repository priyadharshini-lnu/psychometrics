import React from 'react'
import {
  Table, Menu, Row, Col, message,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import ConditionalDropdown from 'components/ConditionalDropdown'
import { useParams } from 'react-router-dom'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import {
  rescoreResponses, exportRawResults, exportScoringResults, exportNormedResults,
  exportRawFactorScores, exportExternalResults,
} from 'modules/admin/modules/campaigns/core/assessments/actions'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { get as getAssessorAssessment } from 'modules/admin/modules/campaigns/core/campaignAssessorAssessments'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessorAssessment(state),
  }),
  {
    rescoreResponses,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
    exportExternalResults,
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments,
  rescoreResponses,
  openModal,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
  exportExternalResults,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <Row>
      <Col span={24}>
        <Table className="mtm" rowKey="id" dataSource={assessments} pagination={false}>
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="id"
            key="id"
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            dataIndex="name"
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={assessment => (
              <ConditionalDropdown
                menu={
                  ActionsMenu({
                    assessment,
                    openModal,
                    campaignId: parsedCampaignId,
                    rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                    exportRawResults,
                    exportScoringResults,
                    exportNormedResults,
                    exportRawFactorScores,
                    exportExternalResults,
                  }) as React.ReactElement
                }
                innerElement={(
                  <a>
                    <MoreOutlined />
                  </a>
                )}
              />
            )}
          />
        </Table>
      </Col>
    </Row>
  )
}

interface ActionMenuProps {
  campaignId: number
  assessment: Assessment
  openModal(name: string, data?: {
    projectId?: number, assessment?: Assessment,
    campaignId: number, campaignAssessmentId: number
  }): void
  rescoreResponses(): void
  exportRawResults: Props['exportRawResults']
  exportScoringResults: Props['exportScoringResults']
  exportNormedResults: Props['exportNormedResults']
  exportRawFactorScores: Props['exportRawFactorScores']
  exportExternalResults: Props['exportExternalResults']
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, assessment, openModal, rescoreResponses, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores,
  exportExternalResults,
}) => {
  const { id, name, permissions } = assessment

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
              Raw (with labels)
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
              Raw (without labels)
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
              Scoring
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
              Normed Factor Scores
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
              Raw Factor Scores
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
              External
            </div>
          </Menu.Item>
        )}
      </Menu.ItemGroup>
      <Menu.ItemGroup key="import" title="Import">
        {permissions.importResults && (
          <Menu.Item key="import_raw">
            <a
              onClick={() => openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })}
            >
              Raw
            </a>
          </Menu.Item>
        )}
        {permissions.importResults && (
          <Menu.Item key="import_scoring">
            <a
              onClick={() => openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })}
            >
              Scoring
            </a>
          </Menu.Item>
        )}
      </Menu.ItemGroup>
      <Menu.Divider />
      {permissions.rescoreResponses && (
        <Menu.Item key="rescoring">
          <a
            onClick={handleRescoreResponse}
          >
            {I18n.t('campaign_assessment.modals.rescore_response.title')}
          </a>
        </Menu.Item>
      )}
    </Menu>
  )
}

export default connecter(AssessmentList)
