import _ from 'lodash'
import {
  useEffect, useState, useMemo,
} from 'react'
import {
  Tabs, Typography, Button,
  message,
  Row,
  Space,
  Col,
  Tag,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'

import { PageLoadSpinner } from '~/glint'

import {
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
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
import { groupDevelopmentActionsByCategory, groupSkillsByCategory } from './utils'
import { USER_IDP_PLAN_STATUS, STATUS_COLORS } from '../constants'

const { I18n } = window

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  status: state.campaigns.idp.status,
}),
{
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  fetchUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & {
  idpUserId: string;
  editMode: boolean;
  operations?: React.ReactNode | null;
  viewType?: 'tabs' | 'list';
}

const emptySkillCategory = {
  category: '',
  skills: [],
}

const UserDevelopmentPlanComponent = ({
  fetchAvailableDevelopmentActions,
  addDevelopmentActionInPlan,
  updateDevelopmentActionInPlan,
  updateDevelopmentActionProgressInPlan,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
  status,
  fetchUserIdpPlan,
  saveUserIdpSkills,
  fetchIdpSkills,
  idpUserId,
  operations,
  viewType = 'tabs',
  editMode = false,
}: Props) => {
  const { tab: paramTab } = useParams() as {tab: string}

  const [tab, setTab] = useState(paramTab || 'list')
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

  useEffect(() => {
    fetchUserIdpPlan(idpUserId).catch((error) => {
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
    fetchAvailableDevelopmentActions(idpUserId, skillId)
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
    saveUserIdpSkills(
      pickedCategoryToAddMoreSkills.skills, pickedCategoryToAddMoreSkills.category, idpUserId,
    ).then(() => (
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

  const handleUpdateDevelopmentActionProgress = (developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>) => {
    updateDevelopmentActionProgressInPlan(developmentAction, idpUserId)
  }

  const handleAddMoreSkill = (category) => {
    setShowAddSkill(true)
    setPickedCategoryToAddMoreSkills(category)
  }

  // If no status is available, then it's still loading
  if (!status) {
    return <PageLoadSpinner size="large" />
  }

  const renderDevelopmentActionViews = () => (
    viewType === 'tabs'
      ? (
        <>
          <Row align="middle" justify="center">
            <Col flex="auto">
              <Space>
                <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
              </Space>
            </Col>
            <Col>
              <Tag color={STATUS_COLORS[status]}>{I18n.t(`idp.user_idp_status.${status}`)}</Tag>
            </Col>
          </Row>
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
      )
      : (
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
      )
  )

  return (
    <>
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
      ) : renderDevelopmentActionViews()}
    </>

  )
}

export default connector(UserDevelopmentPlanComponent)
