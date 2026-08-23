import React, { useState } from 'react'
import {
  Table, MenuProps, Row, Col, App, Button, Switch, Typography,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { ExclamationCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { isSuperAdmin } from '~/core/currentUser'
import { State as UserAssessmentState } from '~/modules/admin/modules/campaigns/core/userAssessments'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { PropsFromRedux } from './connect'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'
import { formatedDate } from '~/utils/time'
import { DetailsDrawer } from './DetailsDrawer'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  assessments: UserAssessmentState
  openModal(name: string, data?: {
     projectId?: number
     userId?: number
     campaignId?: number
     campaignAssessmentId?: number
     testMode?: boolean
     parentType?: ParentResourceType
     parentId?: number
     assessmentId?: number
     name?: string
     action?: (allowAiRescore: boolean) => void
     assessment?: UserAssessment
  }): void
}

type Props = OwnProps & PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments: {
    list,
  },
  openModal,
  rescoreResponse,
  reset,
  remove,
  resetProgress,
  toggleRequireScheduling,
  togglePrework,
  updateMettlSchedule,
  normalizeFactorScores,
  markComplete,
  loadingUpdateMettlSchedule,
  currentUser,
  updateMhsConfidenceInterval,
  updateMhsLeadershipBar,
  updateMhsNormRegion,
  updateMhsNormOption,
}) => {
  const [drawerAssessment, setDrawerAssessment] = useState<UserAssessment | undefined>()

  const { projectId, campaignId, id } = useParams() as { projectId: string, campaignId: string, id: string }
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(id, 10)
  const { modal, message } = App.useApp()

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
            render={(text, record: UserAssessment) => (
              <>
                <Button type="link" size="small" className="p-0" onClick={() => setDrawerAssessment(record)}>
                  {text}
                </Button>
                {record.hoganParticipantId && (
                  <Typography.Text style={{ display: 'block', fontSize: '0.8em' }}>
                    (
                    {record.hoganParticipantId}
                    )
                  </Typography.Text>
                )}
              </>
            )}
          />
          <Column
            title={I18n.t('common.column.require_scheduling')}
            key="requireScheduling"
            render={({ requireScheduling, id, permissions }) => (
              <Switch
                checked={requireScheduling}
                disabled={!permissions?.toggleRequireScheduling}
                onChange={() => {
                  toggleRequireScheduling(parsedCampaignId, id, !requireScheduling)
                }}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.prework')}
            key="category"
            render={({ id, prework, permissions }) => (
              <Switch
                checked={prework}
                disabled={!permissions?.togglePrework}
                onChange={checked => togglePrework(parsedCampaignId, id, checked)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.scheduling')}
            key="scheduling"
            render={assessment => (
              <Button
                type="link"
                onClick={() => openModal('SchedulingAssessmentModal',
                  {
                    projectId: parsedProjectId,
                    campaignId: parsedCampaignId,
                    assessment,
                  })}
              >
                {assessment.scheduleTime ? (
                  formatedDate(assessment.scheduleTime)
                ) : I18n.t('common.text.na')}
              </Button>
            )}
          />
          <Column
            title={I18n.t('common.column.category')}
            key="category"
            render={({ category }) => (
              I18n.t(`activerecord.attributes.assessment.categories.${category}`,
                { defaultValue: _.capitalize(category) })
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.norm')}
            key="normName"
            render={({
              normName, category, id, isExternal, hasExternalNorm, permissions,
            }) => {
              if (category === 'hogan') {
                return normName || I18n.t('common.text.none')
              }

              if ((isExternal && !hasExternalNorm)) {
                return I18n.t('common.text.na')
              }
              return (
                permissions.updateNorm ? (
                  <Button
                    type="link"
                    size="small"
                    className="p-0"
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
                  </Button>
                ) : normName || I18n.t('common.text.default')
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
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    rescoreResponse: (aiRescore = false) => rescoreResponse(parsedCampaignId, assessment.id, aiRescore),
                    openModal,
                    reset,
                    campaignId: parsedCampaignId,
                    userId: parsedUserId,
                    projectId: parsedProjectId,
                    assessment,
                    remove: () => remove(parsedCampaignId, assessment.id),
                    resetProgress,
                    normalizeFactorScores,
                    markComplete,
                    modal,
                    message,
                  })
                }
              />
            )}
          />
        </Table>
        {drawerAssessment ? (
          <DetailsDrawer
            close={() => setDrawerAssessment(undefined)}
            assessment={drawerAssessment}
            campaignId={campaignId}
            updateMettlSchedule={updateMettlSchedule}
            loadingUpdateMettlSchedule={loadingUpdateMettlSchedule}
            isSuperAdmin={isSuperAdmin(currentUser)}
            updateMhsConfidenceInterval={updateMhsConfidenceInterval}
            updateMhsLeadershipBar={updateMhsLeadershipBar}
            updateMhsNormRegion={updateMhsNormRegion}
            updateMhsNormOption={updateMhsNormOption}
          />
        ) : null}
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  assessment: UserAssessment
  userId: number
  campaignId: number
  projectId: number
  rescoreResponse(aiRescore?: boolean): void
  reset(campaignId: number, assessmentId: number): Promise<unknown>
  normalizeFactorScores: Props['normalizeFactorScores']
  resetProgress: Props['resetProgress']
  markComplete: Props['markComplete']
  remove(): void
  openModal(string, data?: {
    campaignId?: number
    userId?: number
    campaignAssessmentId?: number
    parentId?: number
    projectId?: number
    parentType?: ParentResourceType
    testMode?: boolean
    assessmentId?: number
    name?: string
    action?: (allowAiRescore: boolean) => void
    assessment?: UserAssessment
  }): void
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({
  rescoreResponse, openModal, campaignId, userId, projectId, assessment, modal, message,
  reset, remove, resetProgress, normalizeFactorScores, markComplete,
}: ActionMenuData): MenuProps => {
  const { name, permissions } = assessment

  const handleReset = () => {
    modal.confirm({
      title: I18n.t('campaign_assessment.modals.reset.title', { name }),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_assessment.modals.reset.content'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: async () => {
        try {
          await reset(campaignId, assessment.id)
          message.success(I18n.t('campaign_assessment.modals.reset.successfully'))
        } catch (error) {
          message.error(error, 5)
        }
      },
    })
  }

  const handleNormalizeFactorScores = () => {
    normalizeFactorScores(campaignId, assessment.id).then(() => {
      message.success(
        I18n.t('campaign_assessment.normalize_factor_scores.success'),
      )
    }).catch((error) => {
      message.error(error)
    })
  }

  const handleRescoreResponse = () => {
    if (permissions.rescoreAiResponse) {
      openModal('RescoreResponseModal', {
        name,
        action: (allowAiRescore = false) => {
          rescoreResponse(allowAiRescore)
          message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
        },
      })
    } else {
      rescoreResponse()
      message.info(I18n.t('campaign_assessment.modals.rescore_response.message', { name }))
    }
  }
  const handleDelete = () => {
    modal.confirm({
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

  const handleMarkComplete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('user_assessments.modals.mark_as_completed.content', { name }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        markComplete(campaignId, assessment.id)
        message.success(I18n.t('user_assessments.modals.actions.mark_as_completed.success_message', { name }))
      },
    })
  }

  const handleResetProgress = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      content: I18n.t('user_assessments.modals.reset.content', { name }),
      onOk () {
        resetProgress(campaignId, assessment.id)
        message.info(I18n.t('user_assessments.modals.actions.reset_progress.success_message', { name }))
      },
    })
  }

  const responseGroupItems: MenuItem[] = []
  permissions.resetResults && responseGroupItems.push({
    key: 'reset',
    label: I18n.t('common.actions.reset'),
  })
  permissions.rescoreResponse && responseGroupItems.push({
    key: 'rescore',
    label: I18n.t('assessments.actions.rescore'),
  })

  const menuItems: MenuItem[] = [
    {
      type: 'group',
      key: 'response',
      label: I18n.t('common.text.response'),
      children: responseGroupItems,
    },
    { type: 'divider' },
  ]
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })
  permissions.updateAdditionalTime && menuItems.push({
    key: 'extend',
    label: I18n.t('assessments.actions.extend_time'),
  })
  permissions.resetProgress && menuItems.push({
    key: 'resetProgress',
    label: I18n.t('user_assessments.modals.actions.reset_progress.name'),
  })

  permissions.pushWebhook && menuItems.push({
    key: 'pushWebhook',
    label: 'Push Webhook',
  })

  permissions.markComplete && menuItems.push({
    key: 'markComplete',
    label: I18n.t('user_assessments.modals.actions.mark_as_completed.name'),
  })

  permissions.normalizeFactorScores && menuItems.push({
    key: 'normalizeFactorScores',
    label: 'Normalize Factor Scores',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'reset') {
      return handleReset()
    }
    if (key === 'rescore') {
      return handleRescoreResponse()
    }
    if (key === 'remove') {
      return handleDelete()
    }
    if (key === 'extend') {
      return openModal('UpdateTimeModal', { campaignId, userId, campaignAssessmentId: assessment.id })
    }
    if (key === 'pushWebhook') {
      return openModal('PushWebhookModal', {
        campaignId,
        parentType: ParentResourceType.UserAssessment,
        parentId: assessment.id,
        testMode: false,
        projectId,
        assessmentId: assessment.assessmentId,
      })
    }
    if (key === 'resetProgress') {
      return handleResetProgress()
    }
    if (key === 'normalizeFactorScores') {
      return handleNormalizeFactorScores()
    }
    if (key === 'markComplete') {
      return handleMarkComplete()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default AssessmentList
