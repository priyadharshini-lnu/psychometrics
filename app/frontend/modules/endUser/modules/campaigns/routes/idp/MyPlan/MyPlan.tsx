import _ from 'lodash'
import {
  useEffect, useState, useMemo,
} from 'react'
import {
  Tabs, Typography, Layout, Button, Flex,
  message, Modal,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps, useSelector } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'

import { PageLoadSpinner } from '~/glint'
import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'

import {
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  saveUserIdpDevelopmentActions,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  DevelopmentActionListView,
  DevelopmentActionBoardView,
  DevelopmentAction,
  Skill,
  CategoryWithSkillsSummary,
  CategoryWithUserIdpSkills,
} from '~/components/IdpShared/DevelopmentActions'
import { AddSkillsStep } from '~/components/IdpShared/InitialSteps/AddSkillsStep'
import { filteredDevelopmentActions, groupDevelopmentActionsByCategory, groupSkillsByCategory } from './utils'
import { USER_IDP_PLAN_STATUS } from '../constants'

import styles from './MyPlan.less'

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
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  currentUser: state.currentUser,
  status: state.campaigns.idp.status,
}),
{
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  saveUserIdpDevelopmentActions,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const emptySkillCategory = {
  category: '',
  skills: [],
}

const MyPlanComponent = ({
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  saveUserIdpDevelopmentActions,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
  currentUser,
  status,
  fetchUserIdpPlan,
  updateUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
}: Props) => {
  const { tab: paramTab } = useParams() as {tab: string}
  const [tab, setTab] = useState(paramTab || 'list')
  const [editMode, setEditMode] = useState(false)
  // Show skill page
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [pickedCategoryToAddMoreSkills, setPickedCategoryToAddMoreSkills] = useState<CategoryWithUserIdpSkills>(
    emptySkillCategory,
  )
  const [skillCategory, setSkillCategory] = useState<CategoryWithSkillsSummary>(emptySkillCategory)

  const listData = useMemo(() => groupSkillsByCategory(idpSkills, idpDevelopmentActions),
    [idpSkills, idpDevelopmentActions])

  const boardData = useMemo(() => groupDevelopmentActionsByCategory(idpDevelopmentActions, idpSkills),
    [idpDevelopmentActions, idpSkills])

  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  const navigate = useNavigate()

  const changeTab = (tab: string) => {
    setTab(tab)
    navigate(`/idp/my_plan/${tab}`)
  }

  const config = useSelector((state: RootState) => state.config)

  useEffect(() => {
    fetchUserIdpPlan(currentUser.id).catch((error) => {
      message.error(error || I18n.t('common.errors.something_wrong'))
      navigate('/')
    })
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  useEffect(() => {
    if (status && status === USER_IDP_PLAN_STATUS.NOT_STARTED) {
      navigate('/idp/steps/getting_started')
    }
  }, [status])

  useEffect(() => {
    if (showAddSkill) {
      fetchIdpSkills({
        filterByCategory: pickedCategoryToAddMoreSkills?.category,
      }).then(({ response }) => {
        setSkillCategory({
          category: pickedCategoryToAddMoreSkills?.category || '',
          skills: response as Skill[],
        })
      })
    } else {
      setSkillCategory(emptySkillCategory)
    }
  }, [showAddSkill])

  const handleAddDevelopmentAction = (developmentAction: DevelopmentAction) => {
    addDevelopmentActionInPlan(developmentAction)
  }

  const handleShowAvailableDevelopmentAction = (skillId) => {
    fetchAvailableDevelopmentActions(currentUser.id, skillId)
  }

  const handleSelectSkill = (skills) => {
    // Add skillId to skills
    const userIdpSkill = skills.map(skill => ({
      ...skill,
      skillId: skill.id,
    }))
    setPickedCategoryToAddMoreSkills({
      category: pickedCategoryToAddMoreSkills?.category || '',
      skills: _.uniqBy([...pickedCategoryToAddMoreSkills?.skills, ...userIdpSkill], 'skillId'),
    })
  }

  const handleFinishAddSkill = () => {
    saveUserIdpSkills(pickedCategoryToAddMoreSkills.skills, pickedCategoryToAddMoreSkills.category).then(() => (
      setShowAddSkill(false)
    ))
  }

  const handleDeselectSkill = (skillId) => {
    setPickedCategoryToAddMoreSkills({
      category: pickedCategoryToAddMoreSkills?.category || '',
      skills: pickedCategoryToAddMoreSkills?.skills.filter(
        userIdpSkill => userIdpSkill.skillId !== skillId,
      ),
    })
  }

  const handleSave = () => {
    setEditMode(false)
    const actionsArray = _.values(filteredDevelopmentActions(idpDevelopmentActions))
    saveUserIdpDevelopmentActions(currentUser.id, actionsArray).then(() => (
      fetchUserIdpPlan(currentUser.id)
    ))
  }

  const handleUpdateDevelopmentActionProgress = (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => {
    updateDevelopmentActionProgressInPlan(developmentAction)
  }

  const handleCompletion = () => {
    const hasIncompleteDAs = _.values(idpDevelopmentActions).some(action => action.progress < 100)
    if (hasIncompleteDAs && config.idp.requireAllDevelopmentActionsComplete) {
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
            setEditMode(false)
          })
        },
      })
    } else {
      updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.COMPLETED).then(() => {
        setEditMode(false)
      })
    }
  }

  const handleSubmitPlan = () => {
    // TODO: This should update to PENDING_APPROVAL and onec manager approves should update to APPROVED
    updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.APPROVED).then(() => {
      setEditMode(false)
    })
  }

  const handleStartPlan = () => {
    updateUserIdpPlan(currentUser.id, USER_IDP_PLAN_STATUS.PLAN_IN_PROGRESS).then(() => {
      setEditMode(false)
    })
  }

  const handleAddMoreSkill = (category) => {
    setShowAddSkill(true)
    setPickedCategoryToAddMoreSkills(category)
  }


  const operations = (
    <Flex gap={8}>
      {editMode ? (
        <Button
          type="primary"
          onClick={handleSave}
          disabled={status !== USER_IDP_PLAN_STATUS.DRAFT}
        >
          {I18n.t('common.actions.save')}
        </Button>
      ) : (
        <Button
          type="primary"
          disabled={status !== USER_IDP_PLAN_STATUS.DRAFT}
          onClick={() => setEditMode(true)}
        >
          {I18n.t('common.actions.edit')}
        </Button>
      )}

      {(status === USER_IDP_PLAN_STATUS.NOT_STARTED || status === USER_IDP_PLAN_STATUS.DRAFT) && (
        <Button
          // disabled={status !== USER_IDP_PLAN_STATUS.DRAFT || editMode}
          onClick={handleSubmitPlan}
        >
          {I18n.t('idp.development_actions.submit_plan')}
        </Button>
      )}

      {status === USER_IDP_PLAN_STATUS.APPROVED && (
        <Button
          // disabled={status !== USER_IDP_PLAN_STATUS.DRAFT || editMode}
          onClick={handleStartPlan}
        >
          {I18n.t('idp.development_actions.start_plan')}
        </Button>
      )}

      {status === USER_IDP_PLAN_STATUS.PLAN_IN_PROGRESS && (
        <Button
          disabled={status !== USER_IDP_PLAN_STATUS.PLAN_IN_PROGRESS}
          onClick={handleCompletion}
        >
          {I18n.t('idp.development_actions.mark_as_complete')}
        </Button>
      )}
    </Flex>
  )

  // If no status is available, then it's still loading
  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  return (
    <IdpPageLayoutWrapper>
      <Layout.Content className={styles.pageContent}>
        {showAddSkill ? (
          <div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setShowAddSkill(false)}
            />
            <AddSkillsStep
              addSkillButtonText={I18n.t('idp.my_plan.save_skills')}
              skillCategories={[skillCategory]}
              onFinishAddSkill={handleFinishAddSkill}
              selectedSkills={pickedCategoryToAddMoreSkills?.skills || []}
              onDeselectSkill={handleDeselectSkill}
              onAddSkill={handleSelectSkill}
            />
          </div>
        ) : (
          <>
            <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
            <Tabs tabBarExtraContent={operations} activeKey={tab} onChange={tab => changeTab(tab)}>
              <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
                <DevelopmentActionListView
                  editMode={editMode}
                  categories={listData}
                  availableDevelopmentActions={availableDevelopmentActionsData}
                  onAddDevelopmentAction={handleAddDevelopmentAction}
                  onUpdateDevelopmentActionProgress={handleUpdateDevelopmentActionProgress}
                  onUpdateDevelopmentAction={updateDevelopmentActionInPlan}
                  onShowAvailableDevelopmentAction={handleShowAvailableDevelopmentAction}
                  onAddMoreSkills={handleAddMoreSkill}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={I18n.t('idp.board')} key="board">
                <DevelopmentActionBoardView categories={boardData} />
              </Tabs.TabPane>
            </Tabs>
          </>
        )}
      </Layout.Content>
    </IdpPageLayoutWrapper>
  )
}

export const MyPlan = connector(MyPlanComponent)
