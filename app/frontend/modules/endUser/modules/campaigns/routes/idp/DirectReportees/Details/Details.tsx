import _ from 'lodash'
import {
  useState, FC,
} from 'react'
import {
  Typography, Flex, Button, Space,
  message,
  Tag,
  Avatar,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { filteredDevelopmentActions } from '../../UserDevelopmentPlan/utils'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS } from '~/components/IdpShared/constants'
import { getIdpSettings } from '~/modules/endUser/core/config'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpComments,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { DirectionalNavigateBackIcon } from '~/glint'
import styles from '../DirectReportees.less'
import { CheckCircleOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserDevelopmentPlan from '../../UserDevelopmentPlan'
import { Separator } from '~/components/IdpShared/Separator'

const { I18n } = window

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  idpUser: state.campaigns.idp.user,
  status: state.campaigns.idp.status,
  unreadCommentsCount: state.campaigns.idp.unreadCommentsCount,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  idpSettings: getIdpSettings(state),
}),
{
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpComments,
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
  const { userId: idpUserId } = useParams() as { userId: string }
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
    <>
      {(!editMode && managerApprovesIdp) ? (
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
      ) : null}

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
    </>
  )

  const header = (
    <Flex
      align="center"
      justify="space-between"
      className="p-5 pt-2"
    >
      <Flex vertical gap={4} flex={1}>
        <Flex className={`${styles.heading}`} flex={1} justify="space-between">
          <Space>
            <DirectionalNavigateBackIcon
              onClick={() => navigate('/idp/direct_reportees')}
            />
            <Typography.Title
              className="mt-3"
              level={3}
            >
              {I18n.t('idp.direct_reportee_details')}
            </Typography.Title>
          </Space>
          <Space>
            <Tag color={STATUS_COLORS[status]}>
              {I18n.t(`idp.user_idp_status.${status}`)}
            </Tag>
          </Space>
        </Flex>
        <Separator
          className="mb-2 mt-0"
        />
        <Flex align="center" gap={16}>
          <Avatar
            size={32}
            src={idpUser?.avatarUrl}
            className="fs-16"
          >
            {idpUser?.name ? idpUser.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Flex vertical style={{ minWidth: 120 }}>
            <Typography.Text strong>{idpUser?.name || '—'}</Typography.Text>
            <Typography.Text type="secondary">{idpUser?.email || ''}</Typography.Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )

  return (
    <IdpPageLayoutWrapper>
      <Flex className={styles.detailsPageContent}>
        <UserDevelopmentPlan
          header={header}
          idpUserId={idpUserId}
          editMode={editMode}
          viewType="tabs"
          headerHeight={80}
          operations={operations}
        />
      </Flex>
    </IdpPageLayoutWrapper>
  )
}

export const DirectReportDetails = connector(DirectReportDetailsComponent)
