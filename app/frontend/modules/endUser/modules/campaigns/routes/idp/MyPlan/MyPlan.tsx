import { useEffect, useState } from 'react'
import { Tabs, Typography, Layout } from 'antd'
import { useHistory, useParams } from 'react-router-dom'

import { IdpPageLayoutWrapper } from '../components/IdpPageLayoutWrapper/IdpPageLayoutWrapper'
import { BoxWithShadow } from '~/glint'
import { List } from './List'
import { Board } from './Board'

import styles from './MyPlan.less'

const { I18n } = window

export const MyPlan = () => {
  const { tab: paramTab } = useParams<{tab: string}>()
  const [tab, setTab] = useState(paramTab || 'list')
  // const [developmentPlan, setDevelopmentPlan] = useState(null)
  const history = useHistory()
  const changeTab = (tab) => {
    setTab(tab)
    history.push(`/idp/my_plan/${tab}`)
  }

  useEffect(() => {
    // fetch development plan data
    // fetchDevelopmentPlan().then((data) => {
    //   setDevelopmentPlan(data)
    // })
    // if (!developmentPlan) {
    history.push('/idp/steps/getting_start')
    // }
  }, [])

  useEffect(() => {
    if (paramTab !== tab) {
      setTab(paramTab || 'list')
    }
  }, [paramTab])

  return (
    <IdpPageLayoutWrapper>
      <Layout.Content className={styles.pageContent}>
        <Typography.Title level={4}>{I18n.t('idp.my_plan.development_plan')}</Typography.Title>
        <div style={{ display: 'flex' }}>
          <BoxWithShadow className={styles.chart} />
          <BoxWithShadow className={styles.chart} />
          <BoxWithShadow className={styles.chart} />
        </div>
        <Tabs activeKey={tab} onChange={tab => changeTab(tab)}>
          <Tabs.TabPane tab={I18n.t('idp.list')} key="list">
            <List />
          </Tabs.TabPane>
          <Tabs.TabPane tab={I18n.t('idp.board')} key="board">
            <Board />
          </Tabs.TabPane>
        </Tabs>
      </Layout.Content>
    </IdpPageLayoutWrapper>
  )
}
