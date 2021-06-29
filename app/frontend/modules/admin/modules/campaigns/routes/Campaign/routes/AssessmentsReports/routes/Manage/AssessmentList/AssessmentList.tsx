import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, message,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
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
    permissions,
  },
  match: { params: { projectId, campaignId } },
  currentUser,
  reports,
  openModal,
  activateUniversalLink,
  rescoreResponses,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
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

          <Column
            title={I18n.t('campaign_assessment.column.locales')}
            key="availableLocales"
            render={({
              availableLocales, id, isExternal, allLocales,
            }) => {
              if (isExternal) {
                return I18n.t('common.text.na')
              }
              if (!permissions.updateAvailableLocales) {
                return _.join(availableLocales, '')
              }
              return (
                <a
                  onClick={
                    () => openModal('UpdateLocalesModal',
                      {
                        projectId: parsedProjectId,
                        campaignId: parsedCampaignId,
                        campaignAssessmentId: id,
                        availableLocales,
                        allLocales,
                      })
                  }
                >
                  {_.isEmpty(availableLocales) ? I18n.t('frontend.manage') : _.join(availableLocales, ', ')}
                </a>
              )
            }}
          />

          {permissions.enableUniversalLink
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
                      exportRawResults,
                      exportScoringResults,
                      exportNormedResults,
                      exportRawFactorScores,
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
  exportRawResults: Props['exportRawResults']
  exportScoringResults: Props['exportScoringResults']
  exportNormedResults: Props['exportNormedResults']
  exportRawFactorScores: Props['exportRawFactorScores']
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, assessment, openModal, rescoreResponses, exportRawResults,
  exportScoringResults, exportNormedResults, exportRawFactorScores,
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
        { permissions.exportScoringResults && (
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
        { permissions.exportNormedResults && (
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
        { permissions.exportRawFactorScores && (
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
        { permissions.exportExternalResults && (
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
      { permissions.importResults && (
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
