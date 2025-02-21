import _ from 'lodash'
import {
  useState, FC, useMemo, useEffect,
} from 'react'
import {
  Tabs, Typography, Flex, Button, Layout, Space,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import {
  DevelopmentActionListView,
  DevelopmentActionBoardView,
} from '~/components/IdpShared/DevelopmentActions'
import { DirectionalNavigateBackIcon } from '~/glint'
import { IdpUserProfileCard } from '~/components/IdpShared/InitialSteps/IdpUserProfileCard'
import { groupDevelopmentActionsByCategory, groupSkillsByCategory } from '../../MyPlan/utils'
import { IdpPageLayoutWrapper } from '../../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'

import styles from './Details.less'

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

// sample data
const userFields = [
  { field: 'Email', value: 'name@mail.com' },
]
const currentUser = {
  fullName: 'John Doe',
  role: 'Human Resource Director',
}

const DirectReportDetailsComponent: FC<Props> = ({
  fetchUserIdpDevelopmentActions,
  fetchUserIdpSkills,
  fetchAvailableDevelopmentActions,
  idpDevelopmentActions,
  idpSkills,
  availableDevelopmentActions,
}) => {
  const { tab: paramTab, userId } = useParams() as {tab: string, userId: string}
  const [tab, setTab] = useState(paramTab || 'list')

  const navigate = useNavigate()
  const changeTab = (tab: string) => {
    setTab(tab)
    navigate(`/idp/direct_reports/${userId}/${tab}`)
  }

  const listData = useMemo(() => groupSkillsByCategory(idpSkills, idpDevelopmentActions),
    [idpDevelopmentActions, idpSkills])

  const boardData = useMemo(() => groupDevelopmentActionsByCategory(idpDevelopmentActions, idpSkills),
    [idpDevelopmentActions, idpSkills])

  const availableDevelopmentActionsData = useMemo(() => _.values(availableDevelopmentActions),
    [availableDevelopmentActions])

  useEffect(() => {
    fetchUserIdpDevelopmentActions(userId)
    fetchUserIdpSkills(userId)
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  const handleAddDevelopmentAction = () => {
    // This action is not handled properly, should be taken care of when implementing
    // TODO: Pass the skillId when fetching available development actions
    fetchAvailableDevelopmentActions(userId, 0)
  }

  const operations = (
    <Flex gap={8}>
      <Button type="primary">{I18n.t('common.actions.approve')}</Button>
    </Flex>
  )
  return (
    <IdpPageLayoutWrapper>
      <Layout.Content className={styles.pageContent}>
        <Space>
          <DirectionalNavigateBackIcon onClick={() => navigate('/idp/direct_reports')} />
          <Typography.Title level={4}>
            {I18n.t('idp.direct_report_details')}
          </Typography.Title>
        </Space>
        <Space size="large" direction="vertical" className="w-100">
          <IdpUserProfileCard currentUser={currentUser} fields={userFields} />

          <Tabs tabBarExtraContent={operations} activeKey={tab} onChange={tab => changeTab(tab)}>
            <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
              <DevelopmentActionListView
                editMode={false}
                categories={listData}
                availableDevelopmentActions={availableDevelopmentActionsData}
                onAddDevelopmentAction={handleAddDevelopmentAction}
                onAddMoreSkills={() => {}}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={I18n.t('idp.board')} key="board">
              <DevelopmentActionBoardView categories={boardData} />
            </Tabs.TabPane>
          </Tabs>
        </Space>
      </Layout.Content>
    </IdpPageLayoutWrapper>
  )
}

export const DirectReportDetails = connector(DirectReportDetailsComponent)
