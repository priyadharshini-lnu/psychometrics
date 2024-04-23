import _ from 'lodash'
import {
  useEffect, useState, useContext, useMemo,
} from 'react'
import {
  Tabs, Typography, Layout, Button, Flex, Space, theme,
} from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { CloseOutlined } from '@ant-design/icons'
import { generate } from '@ant-design/colors'

import { BoxWithShadow, MediaQueryContext } from '~/glint'
import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'
import { PieChart } from '../components/Graphs/PieChart'
import { KpiChart } from '../components/Graphs/KpiChart'

import {
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
} from '~/modules/endUser/modules/campaigns/core/idp/developmentAction'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  DevelopmentActionListView,
  DevelopmentActionBoardView,
  type CategoryWithSkills,
} from '~/components/IdpShared/DevelopmentActions'
import { AddSkillsStep } from '~/components/IdpShared/InitialSteps/AddSkillsStep'
import { groupDevelopmentActionsByCategory, groupSkillsByCategory } from './utils'

import styles from './MyPlan.less'

const { I18n } = window
const { useToken } = theme

const categoryChartData = [
  { label: I18n.t('idp.my_plan.graphs.behavioural'), value: 45 },
  { label: I18n.t('idp.my_plan.graphs.technical'), value: 30 },
  { label: I18n.t('idp.my_plan.graphs.other'), value: 20 },
]

const learningChartData = [
  { label: I18n.t('idp.my_plan.graphs.learning_structured', { count: 10 }), value: 10 },
  { label: I18n.t('idp.my_plan.graphs.learning_others', { count: 20 }), value: 20 },
  { label: I18n.t('idp.my_plan.graphs.learning_on_job', { count: 70 }), value: 70 },
]

const kpiChartData = {
  behavioural: { label: I18n.t('idp.my_plan.graphs.behavioural'), value: 85 },
  technical: { label: I18n.t('idp.my_plan.graphs.technical'), value: 60 },
  other: { label: I18n.t('idp.my_plan.graphs.other'), value: 40 },
}

const skillCategorySample: CategoryWithSkills = {
  category: 'behavioural',
  skills: [
    {
      id: 423,
      category: 'test',
      description: 'test',
      name: 'Sample one',
      initialRating: 2.0,
      finalRating: 3.0,
      development_actions: [],
    },
    {
      id: 425,
      category: 'test two',
      description: 'test',
      name: 'Sample two',
      initialRating: 2.0,
      finalRating: 3.0,
      development_actions: [],
    },
    {
      id: 2,
      category: 'test',
      description: 'test',
      name: 'Sample three',
      initialRating: 2.0,
      finalRating: 3.0,
      development_actions: [],
    },
  ],
}

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
  currentUser: state.currentUser,
}),
{
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const emptySkillCategory = {
  category: '',
  skills: [],
}

const MyPlanComponent = ({
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
  currentUser,
}: Props) => {
  const { tab: paramTab } = useParams<{tab: string}>()
  const [tab, setTab] = useState(paramTab || 'list')
  const [editMode, setEditMode] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [pickedCategoryToAddMoreSkills, setPickedCategoryToAddMoreSkills] = useState<CategoryWithSkills>(
    emptySkillCategory,
  )

  const listData = useMemo(() => groupSkillsByCategory(idpSkills, idpDevelopmentActions),
    [idpDevelopmentActions, idpSkills])

  const boardData = useMemo(() => groupDevelopmentActionsByCategory(idpDevelopmentActions, idpSkills),
    [idpDevelopmentActions, idpSkills])

  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  const history = useHistory()
  const { isMobile } = useContext(MediaQueryContext)

  const changeTab = (tab: string) => {
    setTab(tab)
    history.push(`/idp/my_plan/${tab}`)
  }
  const { token } = useToken()
  const { colorPrimary } = token

  const colorPalette = generate(colorPrimary)

  useEffect(() => {
    fetchUserIdpDevelopmentActions(currentUser.id)
    fetchUserIdpSkills(currentUser.id)
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  const handleAddDevelopmentAction = () => {
    fetchAvailableDevelopmentActions()
  }

  const handleSelectSkill = (selectedSkills) => {
    setPickedCategoryToAddMoreSkills({
      category: pickedCategoryToAddMoreSkills?.category || '',
      skills: [...pickedCategoryToAddMoreSkills?.skills, ...selectedSkills],
    })
  }

  const handleFinishAddSkill = () => {
    setShowAddSkill(false)
    // post data to backend
  }

  const handleDeselectSkill = (deselectedSkillId) => {
    setPickedCategoryToAddMoreSkills({
      category: pickedCategoryToAddMoreSkills?.category || '',
      skills: pickedCategoryToAddMoreSkills?.skills.filter(
        skill => skill.id !== deselectedSkillId,
      ),
    })
  }

  const operations = (
    <Flex gap={8}>
      {editMode ? (
        <Button
          type="primary"
          onClick={() => setEditMode(false)}
        >
          {I18n.t('common.actions.save')}
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => setEditMode(true)}
        >
          {I18n.t('common.actions.edit')}
        </Button>
      )}
      <Button>{I18n.t('idp.development_actions.submit_plan')}</Button>
    </Flex>
  )

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
              addSkillButtonText={I18n.t('idp.my_plan.add_skill')}
              skillCategories={[skillCategorySample]}
              onFinishAddSkill={handleFinishAddSkill}
              selectedSkills={pickedCategoryToAddMoreSkills?.skills || []}
              onDeselectSkill={handleDeselectSkill}
              onAddSkill={handleSelectSkill}
            />
          </div>
        ) : (
          <>
            <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
            <Space direction={isMobile ? 'vertical' : 'horizontal'}>
              <BoxWithShadow className={styles.chart}>
                <PieChart
                  chartSeriesData={categoryChartData}
                  title={I18n.t('idp.my_plan.graphs.categories')}
                  colors={[colorPrimary, '#CB4525', '#232323']}
                />
              </BoxWithShadow>
              <BoxWithShadow className={styles.chart}>
                <PieChart
                  title=""
                  chartSeriesData={learningChartData}
                  colors={[colorPalette[1], colorPalette[3], colorPalette[5]]}
                />
              </BoxWithShadow>
              <BoxWithShadow className={styles.chart}>
                <KpiChart
                  chartSeriesData={kpiChartData}
                  title={I18n.t('idp.my_plan.graphs.area_of_development')}
                  colors={[colorPrimary, '#CB4525', '#232323']}
                />
              </BoxWithShadow>
            </Space>
            <Tabs tabBarExtraContent={operations} activeKey={tab} onChange={tab => changeTab(tab)}>
              <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
                <DevelopmentActionListView
                  editMode={editMode}
                  categories={listData}
                  availableDevelopmentActions={availableDevelopmentActionsData}
                  onAddDevelopmentAction={handleAddDevelopmentAction}
                  onAddMoreSkills={(category) => {
                    setShowAddSkill(true)
                    setPickedCategoryToAddMoreSkills(category)
                  }}
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
