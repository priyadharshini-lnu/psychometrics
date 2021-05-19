import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, message,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import { rescoreResponses } from 'modules/admin/modules/campaigns/core/assessments/actions'
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
    openModal,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>

const { Column } = Table
const { I18n } = window

type Props =PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments,
  rescoreResponses,
  openModal,
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
              <Dropdown
                overlay={() => (
                  ActionsMenu({
                    assessment,
                    openModal,
                    campaignId: parsedCampaignId,
                    rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                  }) as React.ReactElement
                )}
                trigger={['click']}
              >
                <a>
                  <MoreOutlined />
                </a>
              </Dropdown>
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
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, assessment, openModal, rescoreResponses,
}) => {
  const { id, name, permissions } = assessment

  const handleRescoreResponse = () => {
    rescoreResponses()
    message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
  }

  return (
    <Menu>
      <Menu.ItemGroup key="export" title="Export">
        <Menu.Item key="export_raw_labels" disabled={!permissions.exportRawResults}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={
              `/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_results.xlsx?with_labels=1`
            }
          >
            Raw (with labels)
          </a>
        </Menu.Item>
        <Menu.Item key="export_raw" disabled={!permissions.exportRawResults}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_results.xlsx`}
          >
            Raw (without labels)
          </a>
        </Menu.Item>
        <Menu.Item key="export_scoring" disabled={!permissions.exportScoringResults}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_scoring_results.xlsx`}
          >
            Scoring
          </a>
        </Menu.Item>
        <Menu.Item key="export_normed" disabled={!permissions.exportNormedResults}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_normed_results.xlsx`}
          >
            Normed Factor Scores
          </a>
        </Menu.Item>
        <Menu.Item key="export_raw_scores" disabled={!permissions.exportRawFactorScores}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_factor_scores.xlsx`}
          >
            Raw Factor Scores
          </a>
        </Menu.Item>
        <Menu.Item key="export_external" disabled={!permissions.exportExternalResults}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_external_results.xlsx`}
          >
            External
          </a>
        </Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup key="import" title="Import">
        <Menu.Item key="import_raw" disabled={!permissions.importResults}>
          <a
            onClick={() => openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })}
          >
            Raw
          </a>
        </Menu.Item>
        <Menu.Item key="import_scoring" disabled={!permissions.importResults}>
          <a
            onClick={() => openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })}
          >
            Scoring
          </a>
        </Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="rescoring" disabled={!permissions.rescoreResponses}>
        <a
          onClick={handleRescoreResponse}
        >
          {I18n.t('campaign_assessment.modals.rescore_response.title')}
        </a>
      </Menu.Item>
    </Menu>
  )
}

export default connecter(AssessmentList)
