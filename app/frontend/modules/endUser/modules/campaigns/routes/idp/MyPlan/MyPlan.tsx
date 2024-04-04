import { useEffect, useMemo, useState } from 'react'
import {
  Tabs, Typography, Layout, Button, Flex,
} from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import {
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
} from '~/modules/endUser/modules/campaigns/core/idp/developmentAction'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'
import { BoxWithShadow } from '~/glint'
import {
  DevelopmentActionListView,
  DevelopmentActionBoardView,
} from '~/components/IdpShared/DevelopmentActions'
import styles from './MyPlan.less'
import { groupDevelopmentActionsByCategory, groupSkillsByCategory } from './utils'

const { I18n } = window

const connector = connect((state: RootState) => ({
  idpDevelopmentActions: state.campaigns.idp.userIdpDevelopmentActions,
  idpSkills: state.campaigns.idp.userIdpSkills,
  availableDevelopmentActions: state.campaigns.idp.availableDevelopmentActions,
}),
{
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const MyPlanComponent = ({
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
}: Props) => {
  const { tab: paramTab } = useParams<{tab: string}>()
  const [tab, setTab] = useState(paramTab || 'list')
  const [editMode, setEditMode] = useState(false)

  const listData = useMemo(() => groupSkillsByCategory(idpSkills, idpDevelopmentActions),
    [idpDevelopmentActions, idpSkills])

  const boardData = useMemo(() => groupDevelopmentActionsByCategory(idpDevelopmentActions, idpSkills),
    [idpDevelopmentActions, idpSkills])

  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  const history = useHistory()
  const changeTab = (tab: string) => {
    setTab(tab)
    history.push(`/idp/my_plan/${tab}`)
  }

  useEffect(() => {
    fetchUserIdpDevelopmentActions()
    fetchUserIdpSkills()
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  const handleAddDevelopmentAction = () => {
    fetchAvailableDevelopmentActions()
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
        <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
        <div style={{ display: 'flex' }}>
          <BoxWithShadow className={styles.chart} />
          <BoxWithShadow className={styles.chart} />
          <BoxWithShadow className={styles.chart} />
        </div>
        <Tabs tabBarExtraContent={operations} activeKey={tab} onChange={tab => changeTab(tab)}>
          <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
            <DevelopmentActionListView
              editMode={editMode}
              categories={listData}
              availableDevelopmentActions={availableDevelopmentActionsData}
              onAddDevelopmentAction={handleAddDevelopmentAction}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={I18n.t('idp.board')} key="board">
            <DevelopmentActionBoardView categories={boardData} />
          </Tabs.TabPane>
        </Tabs>
      </Layout.Content>
    </IdpPageLayoutWrapper>
  )
}

export const MyPlan = connector(MyPlanComponent)
