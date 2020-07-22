import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { State as AssessmentState } from 'modules/admin/modules/campaigns/core/assessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'

const { Column } = Table
const { I18n } = window

interface Props {
  assessments: AssessmentState
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  openModal(name: string, data?: {
    projectId: number, campaignId: number, campaignAssessmentId: number, universalLink?: string
  }): void
  activateUniversalLink(campaignId: string, id: number): void
}

const AssessmentList: React.FC<RouteComponentProps & Props> = ({
  assessments: {
    list,
  },
  match: { params: { projectId, campaignId } },
  openModal,
  activateUniversalLink,
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
            render={({ normName, id }) => (
              <a
                onClick={
                  () => openModal('ChangeNormModal',
                    { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                }
              >
                {normName || 'Default'}
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
            render={({ id }) => (
              <Dropdown
                overlay={() => (
                    ActionsMenu({ id }) as React.ReactElement
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
}

const ActionsMenu: React.FC<ActionMenuProps> = () => (
  <Menu>
    <Menu.Item key="edit">
      <div
        role="button"
        tabIndex={-1}
      >
          Raw Export
      </div>
    </Menu.Item>
  </Menu>
)

export default withRouter(AssessmentList)
