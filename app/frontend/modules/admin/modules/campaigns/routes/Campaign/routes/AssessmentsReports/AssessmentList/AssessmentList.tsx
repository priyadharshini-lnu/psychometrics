import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, message,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
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
            render={({ normName, normType, id }) => (
              <a
                onClick={
                  () => openModal('UpdateNormModal',
                    { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                }
              >
                {normName ? `${normName}, ${normType}` : 'Default'}
              </a>
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.universal_link')}
            key="universalLink"
            render={({ enableUniversalLinks, universalLink, id }) => {
              if (enableUniversalLinks) {
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
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={({ id, category, name }) => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({
                      id,
                      name,
                      category,
                      campaignId: parsedCampaignId,
                      openModal,
                      rescoreResponses: () => rescoreResponses(parsedCampaignId, id),
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
  id: number
  name: string
  campaignId: number
  category: string
  openModal(name: string, data?: { projectId?: number, campaignId: number, campaignAssessmentId: number }): void
  rescoreResponses(): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  campaignId, name, id, openModal, category, rescoreResponses,
}) => {
  const isExternal = () => ['hogan', 'mindmill'].includes(category)
  const isInternal = () => !isExternal()
  const handleRescoreResponse = () => {
    rescoreResponses()
    message.info(I18n.t('campaign_assessment.actions.rescore_response.message', { name }))
  }

  return (
    <Menu>
      <Menu.ItemGroup key="export" title="Export">
        {isInternal() && (
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
        {isInternal() && (
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
        {isInternal() && (
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
        {isInternal() && (
        <Menu.Item key="export_normed">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/administration/new_campaigns/${campaignId}/assessments/${id}/export_normed_results.xlsx`}
          >
        Normed
          </a>
        </Menu.Item>
        )}
        {isExternal() && (
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
      {isInternal() && (
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
      <Menu.ItemGroup key="rescore">
        <Menu.Item key="rescoring">
          <a
            onClick={handleRescoreResponse}
          >
            {I18n.t('campaign_assessment.actions.rescore_response.title')}
          </a>
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  )
}

export default withRouter(AssessmentList)
