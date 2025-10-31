import {
  Button, Flex, message, Modal, Dropdown,
  notification, Space, Tooltip, Spin,
} from 'antd'
import _ from 'lodash'
import { connect, ConnectedProps } from 'react-redux'
import { useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import cs from 'classnames'
import { filteredDevelopmentActions } from '../UserDevelopmentPlan/utils'
import IdpPageLayoutWrapper from '~/components/IdpShared/IdpPageLayoutWrapper'
import { getIdpSettings } from '~/modules/endUser/core/config'
import { USER_IDP_PLAN_STATUS } from '~/components/IdpShared/constants'
import UserDevelopmentPlan from '../UserDevelopmentPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  updateUserIdpPlan,
  fetchUserIdpPlan,
  saveUserIdpDevelopmentActions,
  AsyncDownloadTR,
  fetchUserIdpComments,
  fetchUserIdpPlanChanges,
  revertToApprovedIdpPlan,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import styles from './MyPlan.less'
import { DownloadOutlined, DownOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import { MediaQueryContext } from '~/glint'

const { I18n } = window

// Commenting Chart data as can be used later as per requirement
// const { useToken } = theme

// const categoryChartData = [
//   { label: I18n.t('idp.my_plan.graphs.behavioural'), value: 45 },
//   { label: I18n.t('idp.my_plan.graphs.technical'), value: 30 },
//   { label: I18n.t('idp.my_plan.graphs.other'), value: 20 },
// ]

// const learningChartData = [
//   { label: I18n.t('idp.my_plan.graphs.learning_structured', { count: 10 }), value: 10 },
//   { label: I18n.t('idp.my_plan.graphs.learning_others', { count: 20 }), value: 20 },
//   { label: I18n.t('idp.my_plan.graphs.learning_on_job', { count: 70 }), value: 70 },
// ]

// const kpiChartData = {
//   behavioural: { label: I18n.t('idp.my_plan.graphs.behavioural'), value: 85 },
//   technical: { label: I18n.t('idp.my_plan.graphs.technical'), value: 60 },
//   other: { label: I18n.t('idp.my_plan.graphs.other'), value: 40 },
// }

const connector = connect((state: RootState) => ({
  currentUser: state.currentUser,
  status: state.campaigns.idp.status,
  canRevertToLastApproved: state.campaigns.idp.canRevertToLastApproved,
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpConfig: getIdpSettings(state),
  unreadCommentsCount: state.campaigns.idp.unreadCommentsCount,
  skillGapReportAvailable: state.campaigns.idp.skillGapReportAvailable,
  skillGapReportData: state.campaigns.idp.skillGapReportData,
}),
{
  updateUserIdpPlan,
  revertToApprovedIdpPlan,
  fetchUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpComments,
  fetchUserIdpPlanChanges,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux


const MyPlanComponent = ({
  idpDevelopmentActions,
  canRevertToLastApproved,
  currentUser,
  status,
  idpConfig,
  updateUserIdpPlan,
  fetchUserIdpPlan,
  saveUserIdpDevelopmentActions,
  fetchUserIdpPlanChanges,
  revertToApprovedIdpPlan,
}: Props) => {
  const [editMode, setEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { tab: paramTab } = useParams() as {tab: string}

  const { isMobile } = useContext(MediaQueryContext)


  const { requireAllDevelopmentActionsComplete, managerApprovesIdp } = idpConfig

  const isPlanEditable = [
    USER_IDP_PLAN_STATUS.DRAFT,
    USER_IDP_PLAN_STATUS.REJECTED,
    USER_IDP_PLAN_STATUS.APPROVED,
    USER_IDP_PLAN_STATUS.NOT_STARTED,
    USER_IDP_PLAN_STATUS.IN_PROGRESS,
    USER_IDP_PLAN_STATUS.PENDING_APPROVAL,
  ].includes(status)

  const allowSubmitting = managerApprovesIdp && [
    USER_IDP_PLAN_STATUS.NOT_STARTED,
    USER_IDP_PLAN_STATUS.DRAFT,
    USER_IDP_PLAN_STATUS.REJECTED,
  ].includes(status)

  const showPublishPlanButton = (!managerApprovesIdp && status === USER_IDP_PLAN_STATUS.DRAFT)
           || (managerApprovesIdp && status === USER_IDP_PLAN_STATUS.APPROVED)

  const showEditPlanButton = !['reflective_questions'].includes(paramTab)

  const handleCompletion = () => {
    const hasIncompleteDAs = _.values(idpDevelopmentActions).some(action => action.progress < 100)
    if (hasIncompleteDAs && requireAllDevelopmentActionsComplete) {
      Modal.error({
        title: I18n.t('idp.development_actions.incomplete_error'),
        content: I18n.t('idp.development_actions.incomplete_error_message'),
      })
      return
    }

    if (hasIncompleteDAs) {
      Modal.confirm({
        title: I18n.t('idp.development_actions.incomplete_warning'),
        content: I18n.t('idp.development_actions.incomplete_warning_message'),
        onOk: () => {
          updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.COMPLETED).then(() => {
            message.success(I18n.t('idp.development_actions.success'))
          }).catch((error) => {
            message.error(error)
          })
        },
      })
    } else {
      updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.COMPLETED).then(() => {
        message.success(I18n.t('idp.development_actions.success'))
      }).catch((error) => {
        message.error(error)
      })
    }
  }

  const handleSubmitPlan = () => {
    setIsLoading(true)
    if (managerApprovesIdp) {
      updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.PENDING_APPROVAL).catch((error) => {
        message.error(error)
      }).finally(() => {
        setIsLoading(false)
      })
    } else {
      updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.APPROVED).catch((error) => {
        message.error(error)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  const handleStartPlan = () => {
    setIsLoading(true)
    updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.IN_PROGRESS).catch((error) => {
      message.error(error)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleShowDiscardDraft = () => {
    revertToApprovedIdpPlan(currentUser.id).then(() => {
      fetchUserIdpPlan(currentUser.id)
    })
  }

  const handleSave = () => {
    setEditMode(false)
    setIsLoading(true)
    const actionsArray = _.values(filteredDevelopmentActions(idpDevelopmentActions))
    saveUserIdpDevelopmentActions(currentUser.id, actionsArray).then(() => {
      fetchUserIdpPlan(currentUser.id).then(() => {
        fetchUserIdpPlanChanges(currentUser.id)
      })
    }).then(() => {
      message.success(I18n.t('idp.changes_saved_to_plan'))
    })
      .catch((error) => {
        message.error(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleEditPlan = () => {
    if (isPlanEditable && status !== USER_IDP_PLAN_STATUS.DRAFT) {
      updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.DRAFT).catch((error) => {
        message.error(error)
      }).finally(() => {
        setEditMode(true)
      })
    } else {
      setEditMode(true)
    }
  }

  const {
    asyncLoading, makeAsyncRequest,
  } = useAsyncRequestResponse({
    url: `/user_idp_plans/${currentUser.id}/download`,
    data: {},
    responseType: AsyncDownloadTR,
    pollingInterval: 15,
  })

  const menu = {
    items: [{
      label: I18n.t('idp.without_reflection_questions'),
      key: 'without_rq',
      icon: <DownloadOutlined />,
    }],
    onClick: ({ key }) => {
      message.success(I18n.t('threesixty.report_generation_in_progress'), 3)

      makeAsyncRequest({
        lang: I18n.currentLocale(),
        includeReflectiveQuestions: key === 'with_rq',
      }).then((response) => {
        const config = {
          message: I18n.t('jobs.threesixty.reports.download.message'),
          description: <SafeHTML html={
            I18n.t('idp.download.description', { url: response.responseData })}
          />,
          duration: 10 * 60 * 1000, // 10 minutes,
        }
        const type = response.type || 'success'
        notification[type](config)
      })
    },
  }

  menu.items.unshift({
    label: I18n.t('idp.with_reflection_questions'),
    key: 'with_rq',
    icon: <DownloadOutlined />,
  })

  const operations = (
    <Flex gap={8} flex={1} justify="end">
      <Dropdown menu={menu} trigger={['click']}>
        <Tooltip title={I18n.t('common.actions.download')}>
          <Button
            aria-label={I18n.t('idp.download_plan')}
            loading={asyncLoading}
            icon={<DownloadOutlined />}
          >
            <Space>
              <DownOutlined />
            </Space>
          </Button>
        </Tooltip>
      </Dropdown>
      {showEditPlanButton && editMode ? (
        <Button
          onClick={handleSave}
          type="primary"
        >
          {I18n.t('idp.development_actions.save_plan')}
        </Button>
      ) : null}
      {showEditPlanButton && !editMode && isPlanEditable
        ? (
          <Button
            icon={<EditOutlined />}
            onClick={handleEditPlan}
          >
            {I18n.t('idp.edit_plan')}
          </Button>
        ) : null
        }
      {canRevertToLastApproved ? (
        <Button
          onClick={handleShowDiscardDraft}
        >
          {I18n.t('idp.development_actions.discard_draft')}
        </Button>
      ) : null}
      {!editMode && (
        <>
          {allowSubmitting && (
            <Button
              type="primary"
              onClick={handleSubmitPlan}
            >
              {I18n.t('idp.development_actions.submit_plan')}
            </Button>
          )}

          {showPublishPlanButton && (
            <Button
              onClick={handleStartPlan}
            >
              {I18n.t('idp.development_actions.publish_plan')}
            </Button>
          )}
          {status === USER_IDP_PLAN_STATUS.IN_PROGRESS && (
            <Button
              onClick={handleCompletion}
            >
              {I18n.t('idp.development_actions.mark_as_complete')}
            </Button>
          )}

        </>
      )}
    </Flex>
  )

  return (
    <IdpPageLayoutWrapper>
      <Flex className={cs(styles.pageContent, !isMobile ? 'overflow-y-hidden' : '')}>
        <Spin spinning={isLoading}>
          <UserDevelopmentPlan
            idpUserId={currentUser.id}
            editMode={editMode}
            operations={operations}
          />
        </Spin>

      </Flex>
    </IdpPageLayoutWrapper>
  )
}

export const MyPlan = connector(MyPlanComponent)
