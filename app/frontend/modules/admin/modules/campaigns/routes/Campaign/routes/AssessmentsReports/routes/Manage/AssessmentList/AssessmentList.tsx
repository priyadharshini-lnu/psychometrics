import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, message,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import AssessmentPolicy from 'modules/admin/modules/campaigns/policies/Assessment'
import User from 'modules/admin/modules/campaigns/interfaces/User'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import Report from 'modules/admin/modules/campaigns/interfaces/Report'
import { PropsFromRedux } from './connect'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
}

type Props = RouteComponentProps & OwnProps & PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments: {
    list,
  },
  match: { params: { projectId, campaignId } },
  currentUser,
  reports,
  openModal,
  activateUniversalLink,
  rescoreResponses,
}) => {
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <Row>
      <Col span={24}>
        <Table className="mtm" rowKey="id" dataSource={list} pagination={false}>
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="assessmentId"
            key="assessmentId"
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            dataIndex="name"
          />
          <Column
            title={I18n.t('common.column.category')}
            key="category"
            render={({ category }) => _.capitalize(category)}
          />
          <Column
            title={I18n.t('campaign_assessment.column.norm')}
            key="normName"
            render={({
              normName, id, isExternal,
            }) => {
              if (isExternal) {
                return I18n.t('common.text.na')
              }
              return (
                <a
                  onClick={
                    () => openModal('UpdateNormModal',
                      { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                  }
                >
                  {normName || I18n.t('common.text.default')}
                </a>
              )
            }}
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessor_form')}
            key="assessorFormName"
            render={({
              assessorFormName, id,
            }) => (
              <a
                onClick={
                    () => openModal('UpdateAssessorFormModal',
                      { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                  }
              >
                {assessorFormName || I18n.t('common.text.na')}
              </a>
            )}
          />
          {AssessmentPolicy.enableUniversalLink(currentUser)
            && (
            <Column
              title={I18n.t('campaign_assessment.column.universal_link')}
              key="universalLink"
              render={({
                enableUniversalLinks, universalLink, id, isExternal,
              }) => {
                if (isExternal) {
                  return I18n.t('common.text.na')
                }
                if (enableUniversalLinks && !isExternal) {
                  return (
                    <a
                      onClick={
                          () => openModal('UniversalLinkModal',
                            {
                              projectId: parsedProjectId,
                              campaignId: parsedCampaignId,
                              campaignAssessmentId: id,
                              universalLink,
                            })
                        }
                    >
                      {I18n.t('frontend.manage')}
                    </a>
                  )
                }
                return <a onClick={() => activateUniversalLink(campaignId, id)}>{I18n.t('frontend.activate')}</a>
              }}
            />
            )}
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={assessment => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({
                      assessment,
                      currentUser,
                      reports,
                      campaignId: parsedCampaignId,
                      openModal,
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
  currentUser: User
  reports: Report[]
  openModal(name: string, data?: { projectId?: number, assessment?: Assessment,
    campaignId: number, campaignAssessmentId: number }): void
  rescoreResponses(): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, assessment, openModal, rescoreResponses, currentUser,
}) => {
  const { id, name } = assessment

  const handleRescoreResponse = () => {
    rescoreResponses()
    message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
  }

  return (
    <Menu>
      <Menu.ItemGroup key="export" title="Export">
        {AssessmentPolicy.exportRawResultsWithLabel(currentUser, assessment) && (
        <Menu.Item key="export_raw_labels">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_results.xlsx?with_labels=1`}
          >
            Raw (with labels)
          </a>
        </Menu.Item>
        )}
        {AssessmentPolicy.exportRawResultsWithoutLabel(currentUser, assessment) && (
        <Menu.Item key="export_raw">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_results.xlsx`}
          >
            Raw (without labels)
          </a>
        </Menu.Item>
        )}
        {AssessmentPolicy.exportScoringResults(currentUser, assessment) && (
        <Menu.Item key="export_scoring">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_scoring_results.xlsx`}
          >
            Scoring
          </a>
        </Menu.Item>
        )}
        {AssessmentPolicy.exportNormedResults(currentUser, assessment) && (
        <Menu.Item key="export_normed">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_normed_results.xlsx`}
          >
            Normed Factor Scores
          </a>
        </Menu.Item>
        )}
        {AssessmentPolicy.exportRawFactorScores(currentUser, assessment) && (
        <Menu.Item key="export_raw_scores">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_raw_factor_scores.xlsx`}
          >
            Raw Factor Scores
          </a>
        </Menu.Item>
        )}
        {AssessmentPolicy.exportExternalResults(currentUser, assessment) && (
        <Menu.Item key="export_external">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_external_results.xlsx`}
          >
            External
          </a>
        </Menu.Item>
        )}
      </Menu.ItemGroup>
      {AssessmentPolicy.importResults(currentUser, assessment) && (
      <Menu.ItemGroup key="import" title="Import">
        <Menu.Item key="import_raw">
          <a
            onClick={() => openModal('ImportRawModal', { campaignId, campaignAssessmentId: id })}
          >
            Raw
          </a>
        </Menu.Item>
        <Menu.Item key="import_scoring">
          <a
            onClick={() => openModal('ImportScoringModal', { campaignId, campaignAssessmentId: id })}
          >
            Scoring
          </a>
        </Menu.Item>
      </Menu.ItemGroup>
      )}
      <Menu.Divider />
      <Menu.Item key="rescoring">
        <a
          onClick={handleRescoreResponse}
        >
          {I18n.t('campaign_assessment.modals.rescore_response.title')}
        </a>
      </Menu.Item>
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
    </Menu>
  )
}

export default withRouter(AssessmentList)
