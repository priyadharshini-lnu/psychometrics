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
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import UserDevelopmentPlan from '~/components/IdpShared/UserDevelopmentPlan'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS } from '~/components/IdpShared/constants'
import { getIdpSettings } from '~/modules/endUser/core/config'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { DirectionalNavigateBackIcon } from '~/glint'
import { IdpUserProfileCard } from '~/components/IdpShared/InitialSteps/IdpUserProfileCard'

import styles from '../DirectReportees.less'
import { CheckCircleOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { filteredDevelopmentActions } from '~/components/IdpShared/UserDevelopmentPlan/utils'

const { I18n } = window

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  idpUser: state.campaigns.idp.user,
  status: state.campaigns.idp.status,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  idpSettings: getIdpSettings(state),
}),
{
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
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
}) => {
  const { tab: paramTab, userId: idpUserId } = useParams() as {tab: string, userId: string}
  const [tab, setTab] = useState(paramTab || 'plan')
  const [editMode, setEditMode] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { managerApprovesIdp, managerCanEditIdp } = idpSettings

  const planInPorgress = status === USER_IDP_PLAN_STATUS.IN_PROGRESS
  const planCompleted = status === USER_IDP_PLAN_STATUS.COMPLETED
  const isPlanEditable = !planInPorgress && !planCompleted
  const isPlanEditableByManager = isPlanEditable && managerCanEditIdp
  const planRequiresApproval = !planInPorgress && !planCompleted && managerApprovesIdp

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

  const operations = (
    <Flex gap={8}>
      {!editMode
      && planRequiresApproval
      && (
        <>
          <Button
            type="default"
            onClick={() => updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.REJECTED)}
            loading={isUpdating}
            disabled={status === USER_IDP_PLAN_STATUS.REJECTED || status === USER_IDP_PLAN_STATUS.COMPLETED}
          >
            {status === USER_IDP_PLAN_STATUS.REJECTED
              ? I18n.t('idp.user_idp_status.rejected') : I18n.t('common.actions.reject')}
          </Button>
          <Button
            type="primary"
            onClick={() => updateReporteeIdpStatus(USER_IDP_PLAN_STATUS.APPROVED)}
            loading={isUpdating}
            disabled={status === USER_IDP_PLAN_STATUS.APPROVED}
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
        isPlanEditableByManager && (
          <Button
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
