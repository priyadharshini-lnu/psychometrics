import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { State as UserAssessmentState } from 'modules/admin/modules/campaigns/core/userAssessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'

const { Column } = Table
const { I18n } = window

interface Props {
  assessments: UserAssessmentState
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  openModal(name: string, data?: { projectId: number, campaignId: number, campaignAssessmentId: number }): void
}

const AssessmentList: React.FC<RouteComponentProps & Props> = ({
  assessments: {
    list,
  },
  match: { params: { projectId, campaignId } },
  openModal,
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
                {normName || I18n.t('common.text.default')}
              </a>
            )}
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
    <Menu.ItemGroup key="response" title={I18n.t('common.text.response')}>
      <Menu.Item key="reset">
        <div
          role="button"
          tabIndex={-1}
        >
          {I18n.t('common.actions.reset')}
        </div>
      </Menu.Item>
      <Menu.Item key="rescore">
        <div
          role="button"
          tabIndex={-1}
        >
          {I18n.t('assessments.actions.rescore')}
        </div>
      </Menu.Item>
    </Menu.ItemGroup>
    <Menu.Divider />
    <Menu.Item key="remove">
      <div
        role="button"
        tabIndex={-1}
      >
        {I18n.t('common.actions.remove')}
      </div>
    </Menu.Item>
    <Menu.Item key="extend">
      <div
        role="button"
        tabIndex={-1}
      >
        {I18n.t('assessments.actions.extend_time')}
      </div>
    </Menu.Item>
  </Menu>
)

export default withRouter(AssessmentList)
