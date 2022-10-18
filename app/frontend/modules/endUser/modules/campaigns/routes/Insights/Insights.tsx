import React, { FC, useEffect, useContext } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Layout, Typography, Tabs,
} from 'antd'
import { RouteComponentProps } from 'react-router-dom'

import LangDropdown from 'components/LangDropdown'
import { MediaQueryContext, PageHeader } from 'glint'
import { RootState } from 'modules/user/core/rootReducers'
import {
  fetchInsights, getReports, getUserDashboard, FETCH_INSIGHTS,
} from 'modules/user/modules/campaigns/core/campaign'
import Report from 'modules/reports/report'
import _ from 'lodash'
import { isRequestInProgress } from 'core/request'
import { InsightsHeader } from './InsightsHeader'
import { ReportList } from './ReportList'

import styles from './styles.less'
import { PageContentSkeleton } from '../../components/PageContentSkeleton'

const { I18n } = window
const current = I18n.locale
const locales = I18n.availableLocales
const { Content } = Layout

const connector = connect(
  (state: RootState) => ({
    userDashboard: getUserDashboard(state),
    isUserReportAvailable: !_.isEmpty(getReports(state)),
    isInsightLoading: isRequestInProgress(state, FETCH_INSIGHTS),
  }),
  {
    fetchInsights,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Params = {
  url: string
}
type Props = RouteComponentProps<Params> & PropsFromRedux

const InsightsComponent: FC<Props> = ({
  match, userDashboard, fetchInsights, isUserReportAvailable, isInsightLoading,
}) => {
  useEffect(() => {
    fetchInsights(match.url)
  }, [match.url])

  return (
    <>
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown locales={locales} current={current} />
        </Col>
      </PageHeader>
      <Content className={styles.pageContent}>
        {isInsightLoading ? <PageContentSkeleton /> : (
          <>
            <InsightsHeader />
            <InsightsBody userDashboard={userDashboard} isUserReportAvailable={isUserReportAvailable} />
          </>
        )}
      </Content>
    </>
  )
}
export const Insights = connector(InsightsComponent)

interface InsightBodyProps {
  userDashboard: Props['userDashboard']
  isUserReportAvailable: boolean
}

const InsightsBody: FC<InsightBodyProps> = ({ userDashboard, isUserReportAvailable }) => {
  const { isMobile } = useContext(MediaQueryContext)
  const width = isMobile ? window.innerWidth : window.innerWidth - 200
  const MAX = 1000
  const scale = Math.max(Math.min(width / MAX, 2), 1)
  const offsetTop = (1 - scale) / 2 * 100
  const offsetLeft = isMobile ? ((1 - scale) / 3) * 105 : ((1 - scale) * (200 / window.innerWidth)) * 100
  const transform = scale < 1
    ? `translate(-${offsetLeft}%, -${offsetTop}%) scale(${scale})`
    : `translate(0, ${Math.abs(offsetTop)}%) scale(${scale})`

  const report = userDashboard && (
    <Row gutter={[0, 16]} justify="center">
      <Col className={styles.report} style={{ transform }}>
        <Report
          data={userDashboard.report}
          results={userDashboard.results}
          campaign={JSON.stringify({})}
          user={JSON.stringify(userDashboard.user)}
          locales={userDashboard.report.locales}
          selectedLocale={userDashboard.report.defaultLanguage}
          userReport={userDashboard}
          dashboard
        />
      </Col>
    </Row>
  )

  if (isMobile) {
    return <InsightsMobileView userDashboardReport={report} isUserReportAvailable={isUserReportAvailable} />
  }

  return <InsightsDesktopView userDashboardReport={report} isUserReportAvailable={isUserReportAvailable} />
}

interface InsightViewProps {
  userDashboardReport: React.ReactNode
  isUserReportAvailable: boolean
}

const InsightsMobileView: FC<InsightViewProps> = ({ userDashboardReport, isUserReportAvailable }) => (
  <div className={styles.content}>
    <Tabs defaultActiveKey="Dashboard">
      {userDashboardReport && (
        <Tabs.TabPane key="Dashboard" tab={I18n.t('campaign.panels.dashboard')} style={{ margin: '0 -24px' }}>
          {userDashboardReport}
        </Tabs.TabPane>
      )}
      {isUserReportAvailable && (
        <Tabs.TabPane tab={I18n.t('campaign.panels.reports')}>
          <ReportList />
        </Tabs.TabPane>
      )}
    </Tabs>
  </div>
)

const InsightsDesktopView: FC<InsightViewProps> = ({ userDashboardReport, isUserReportAvailable }) => (
  <div className={styles.content}>
    {isUserReportAvailable && (
      <>
        <Typography.Title level={4} className={styles.title}>
          {I18n.t('campaign.panels.reports')}
        </Typography.Title>
        <ReportList />
      </>
    )}
    {userDashboardReport && (
      <>
        <Typography.Title level={4} className={styles.title}>
          {I18n.t('campaign.panels.dashboard')}
        </Typography.Title>
        {userDashboardReport}
      </>
    )}
  </div>
)
