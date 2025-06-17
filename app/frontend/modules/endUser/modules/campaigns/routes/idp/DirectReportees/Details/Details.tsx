import _ from 'lodash'
import {
  useState, FC, useEffect,
} from 'react'
import {
  Tabs, Typography, Flex, Button, Layout, Space,
  message,
  Tag,
  Row,
  Col,
  Empty,
  Badge,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { MessageOutlined } from '@ant-design/icons'
import { filteredDevelopmentActions } from '../../UserDevelopmentPlan/utils'
import { IdpUserProfileCard } from '~/components/IdpShared/IdpUserProfileCard'
import UserDevelopmentPlan from '../../UserDevelopmentPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS } from '~/components/IdpShared/constants'
import { getIdpSettings } from '~/modules/endUser/core/config'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpComments,
  addUserIdpComment,
  UserIdpCommentsQuery,
  UserIdpCommentPayload,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { DirectionalNavigateBackIcon } from '~/glint'

import styles from '../DirectReportees.less'
import { CheckCircleOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  idpUser: state.campaigns.idp.user,
  status: state.campaigns.idp.status,
  unreadCommentsCount: state.campaigns.idp.unreadCommentsCount,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  idpSettings: getIdpSettings(state),
  idpComments: state.campaigns.idp.userIdpComments,
}),
{
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpComments,
  addUserIdpComment,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const DirectReportDetailsComponent: FC<Props> = ({
  idpDevelopmentActions,
  fetchUserIdpPlan,
  idpUser,
  status,
  updateUserIdpPlan,
  idpSettings,
  saveUserIdpDevelopmentActions,
  unreadCommentsCount,
  fetchUserIdpComments,
  addUserIdpComment,
  idpComments,
}) => {
  const { tab: paramTab, userId: idpUserId } = useParams() as {tab: string, userId: string}
  const [tab, setTab] = useState(paramTab || 'plan')
  const [editMode, setEditMode] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { managerApprovesIdp, managerCanEditIdp } = idpSettings

  const isPlanEditable = [
    USER_IDP_PLAN_STATUS.PENDING_APPROVAL,
    USER_IDP_PLAN_STATUS.REJECTED,
  ].includes(status)

  const canNotModifyApprovalState = [
    USER_IDP_PLAN_STATUS.IN_PROGRESS,
    USER_IDP_PLAN_STATUS.COMPLETED,
    USER_IDP_PLAN_STATUS.DRAFT,
    USER_IDP_PLAN_STATUS.NOT_STARTED,
  ].includes(status)

  const navigate = useNavigate()
  const changeTab = (tab: string) => {
    setTab(tab)
    navigate(`/idp/direct_reportees/${idpUserId}/${tab}`)
  }

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'plan')
    }
  }, [paramTab])

  const handleSave = () => {
    setEditMode(false)
    const actionsArray = _.values(filteredDevelopmentActions(idpDevelopmentActions))
    saveUserIdpDevelopmentActions(idpUserId, actionsArray).then(() => (
      fetchUserIdpPlan(idpUserId)
    ))
  }

  const updateReporteeIdpStatus = (status: string) => {
    setIsUpdating(true)
    updateUserIdpPlan(idpUser.id, status).then(() => {
      setIsUpdating(false)
    }).catch(() => {
      setIsUpdating(false)
      message.error(I18n.t('common.errors.something_wrong'))
    })
  }

  // TODO: Remove this
  // eslint-disable-next-line no-console
  console.log('Comments', idpComments)

  const handleShowComments = (userIdpSkillId = null) => {
    const query: UserIdpCommentsQuery = {
      page: 1,
    }

    if (userIdpSkillId) {
      query.q = {}
      query.q.resourceIdEq = userIdpSkillId
      query.q.resourceTypeEq = 'UserIdpSkill'
    }
    fetchUserIdpComments(idpUserId, query).then(() => {
    }).catch(() => {
      message.error(I18n.t('common.errors.something_wrong'))
    })
  }

  // TODO: Add implementation for adding a comment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddComment = (comment: string, userIdpSkillId = null) => {
    const payload: UserIdpCommentPayload = {
      content: comment,
      resourceId: null,
      resourceType: null,
    }

    if (userIdpSkillId) {
      payload.resourceId = userIdpSkillId
      payload.resourceType = 'UserIdpSkill'
    }
    addUserIdpComment(idpUserId, payload).then(() => {
      // TODO: Remove this
      // eslint-disable-next-line no-console
      console.log('Comment added successfully')
    }).catch(() => {
      message.error(I18n.t('common.errors.something_wrong'))
    })
  }

  const operations = (
    <Flex gap={8}>
      {/* TODO: TO BE REMOVED */}
      {/* <Button
        color="default"
        variant="solid"
        onClick={() => handleAddComment('Test comment')}
      >
        Add Test Comment
      </Button> */}
      <Badge count={unreadCommentsCount} size="small">
        <Button
          color="default"
          variant="solid"
          icon={(
            <MessageOutlined />

              )}
          onClick={() => handleShowComments()}
        >
          {I18n.t('idp.comments')}
        </Button>
      </Badge>
      {!editMode
      && managerApprovesIdp
      && (
        <>
          <Button
            type="default"
            onClick={() => updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.REJECTED)}
            loading={isUpdating}
            disabled={status === USER_IDP_PLAN_STATUS.REJECTED || canNotModifyApprovalState}
          >
            {status === USER_IDP_PLAN_STATUS.REJECTED
              ? I18n.t('idp.user_idp_status.rejected') : I18n.t('common.actions.reject')}
          </Button>
          <Button
            type="primary"
            onClick={() => updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.APPROVED)}
            loading={isUpdating}
            disabled={status === USER_IDP_PLAN_STATUS.APPROVED || canNotModifyApprovalState}
            icon={status === USER_IDP_PLAN_STATUS.APPROVED && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          >
            {status === USER_IDP_PLAN_STATUS.APPROVED
              ? I18n.t('idp.user_idp_status.approved') : I18n.t('common.actions.approve')}
          </Button>
        </>
      )}

      {editMode ? (
        <Button
          type="primary"
          onClick={handleSave}
        >
          {I18n.t('common.actions.save')}
        </Button>
      ) : (
        managerCanEditIdp && (
          <Button
            disabled={!isPlanEditable}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditMode(true)}
          >
            {I18n.t('idp.edit_plan')}
          </Button>
        )
      )}
    </Flex>
  )

  return (
    <IdpPageLayoutWrapper>
      <Layout.Content className={styles.pageContent}>
        <Row align="middle" justify="center">
          <Col flex="auto">
            <Space>
              <DirectionalNavigateBackIcon
                onClick={() => navigate('/idp/direct_reportees')}
                style={{ fontSize: '18px', verticalAlign: 'middle' }}
              />
              <Typography.Title level={3}>
                {I18n.t('idp.direct_reportee_details')}
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Tag color={STATUS_COLORS[status]}>{I18n.t(`idp.user_idp_status.${status}`)}</Tag>
          </Col>
        </Row>
        <Space size="large" direction="vertical" className="w-100">
          <IdpUserProfileCard idpUser={idpUser} />
          <Tabs tabBarExtraContent={operations} activeKey={tab} onChange={tab => changeTab(tab)}>
            <Tabs.TabPane tab={I18n.t('idp.plan')} key="plan">
              <UserDevelopmentPlan
                idpUserId={idpUserId}
                editMode={editMode}
                viewType="list"
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={I18n.t('idp.skill_gap_report.title')} key="skill_gap_report">
              <Empty />
            </Tabs.TabPane>
            <Tabs.TabPane tab={I18n.t('idp.reflective_questions.title')} key="reflective_questions">
              <Empty />
            </Tabs.TabPane>
          </Tabs>
        </Space>
      </Layout.Content>
    </IdpPageLayoutWrapper>
  )
}

export const DirectReportDetails = connector(DirectReportDetailsComponent)
