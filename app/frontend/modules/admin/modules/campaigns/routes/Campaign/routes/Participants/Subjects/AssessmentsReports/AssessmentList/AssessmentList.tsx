import React from 'react'
import {
  Table, Menu, Row, Col, Dropdown, message, Modal,
} from 'antd'
import { MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { State as UserAssessmentState } from 'modules/admin/modules/campaigns/core/userAssessments'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import UserAssessment from 'modules/admin/modules/campaigns/interfaces/UserAssessment'
import { PropsFromRedux } from './connect'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  assessments: UserAssessmentState
  match: {
    params: {
      projectId: string
      campaignId: string
      id: string
    }
  }
  openModal(name: string, data?: {
     projectId: number
     userId: number
     campaignId: number
     campaignAssessmentId: number
  }): void
}

type Props = RouteComponentProps & OwnProps & PropsFromRedux

const AssessmentList: React.FC<RouteComponentProps & Props> = ({
  assessments: {
    list,
  },

  match: { params: { projectId, campaignId, id } },
  openModal,
  rescoreResponse,
  reset,
  remove,
}) => {
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(id, 10)

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
                      {
                        projectId: parsedProjectId,
                        campaignId: parsedCampaignId,
                        campaignAssessmentId: id,
                        userId: parsedUserId,
                      })
                  }
                >
                  {normName || I18n.t('common.text.default')}
                </a>
              )
            }}
          />

          <Column
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status }) => I18n.t(`campaign_assessment.statuses.${status}`)}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={assessment => (
              <Dropdown
                overlay={() => (
                  ActionsMenu({
                    rescoreResponse: () => rescoreResponse(parsedCampaignId, assessment.id),
                    openModal,
                    reset,
                    campaignId: parsedCampaignId,
                    userId: parsedUserId,
                    assessment,
                    remove: () => remove(parsedCampaignId, assessment.id),
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
  assessment: UserAssessment
  userId: number
  campaignId: number
  rescoreResponse(): void
  reset(campaignId: number, assessmentId: number): Promise<unknown>
  remove(): void
  openModal(string, data?: { campaignId: number, userId: number, campaignAssessmentId: number }): void
}

const ActionsMenu: React.FC<ActionMenuProps> = ({
  rescoreResponse, openModal, campaignId, userId, assessment, reset, remove,
}) => {
  const { name, permissions } = assessment

  const handleReset = () => {
    Modal.confirm({
      title: I18n.t('campaign_assessment.modals.reset.title', { name }),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.reset.content'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        reset(campaignId, assessment.id).then(() => {
          message.success(I18n.t('campaign_assessment.modals.reset.successfully'))
        })
      },
    })
  }

  const handleRescoreResponse = () => {
    rescoreResponse()
    message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
  }

  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('user_assessments.modals.remove.content', { name }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('user_assessments.modals.remove.successfully', { name }))
      },
    })
  }

  return (
    <Menu>
      <Menu.ItemGroup key="response" title={I18n.t('common.text.response')}>
        {permissions.resetResults ? (
          <Menu.Item key="reset">
            <div
              role="button"
              tabIndex={-1}
              onClick={handleReset}
            >
              {I18n.t('common.actions.reset')}
            </div>
          </Menu.Item>
        ) : null }
        <Menu.Item key="rescore">
          <div
            role="button"
            tabIndex={-1}
            onClick={handleRescoreResponse}
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
          onClick={handleDelete}
        >
          {I18n.t('common.actions.remove')}
        </div>
      </Menu.Item>
      {permissions.updateAdditionalTime ? (
        <Menu.Item key="extend">
          <div
            role="button"
            tabIndex={-1}
            onClick={() => openModal('UpdateTimeModal', { campaignId, userId, campaignAssessmentId: assessment.id })}
          >
            {I18n.t('assessments.actions.extend_time')}
          </div>
        </Menu.Item>
      ) : null}
    </Menu>
  )
}

export default withRouter(AssessmentList)
