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
  fetchInsights,
} from 'modules/user/modules/campaigns/core/campaign'
import Report from 'modules/reports/report'
import { InsightsHeader } from './InsightsHeader'
import { ReportList } from './ReportList'

import styles from './styles.less'

const { I18n } = window
const current = I18n.locale
const locales = I18n.availableLocales
const { Content } = Layout

const connector = connect(
  (state: RootState) => ({
    userReport: state.campaigns.campaign.userReport,
  }),
  {
    fetchInsights,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Params = {
  url: string
}

type ComponentProps = RouteComponentProps<Params> & PropsFromRedux

const InsightsMobileView = ({ report }) => (
  <Content className={styles.pageContent}>
    <div className={styles.content}>
      <Tabs defaultActiveKey="Dashboard">
        <Tabs.TabPane key="Dashboard" tab={I18n.t('campaign.panels.dashboard')} style={{ margin: '0 -24px' }}>
          {report}
        </Tabs.TabPane>
        <Tabs.TabPane tab={I18n.t('campaign.panels.reports')}>
          <ReportList />
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Content>
)

const InsightsDesktopView = ({ userReport, report }) => (
  <Content className={styles.pageContent}>
    <div className={styles.content}>
      <Typography.Title level={4} className={styles.title}>
        {I18n.t('campaign.panels.reports')}
      </Typography.Title>
      <ReportList />
      {userReport && (
      <Typography.Title level={4} className={styles.title}>
        {I18n.t('campaign.panels.dashboard')}
      </Typography.Title>
      )}
    </div>
    {report}
  </Content>
)

const InsightsComponent: FC<ComponentProps> = ({
  match, userReport, fetchInsights,
}) => {
  useEffect(() => {
    fetchInsights(match.url)
  }, [match.url])

  const { isMobile } = useContext(MediaQueryContext)
  const width = isMobile ? window.innerWidth : window.innerWidth - 200
  const MAX = 1000
  const scale = Math.max(Math.min(width / MAX, 2), 1)
  const offsetTop = (1 - scale) / 2 * 100
  const offsetLeft = isMobile ? ((1 - scale) / 3) * 105 : ((1 - scale) * (200 / window.innerWidth)) * 100
  const transform = scale < 1
    ? `translate(-${offsetLeft}%, -${offsetTop}%) scale(${scale})`
    : `translate(0, ${Math.abs(offsetTop)}%) scale(${scale})`


  const report = userReport && (
    <Row gutter={[0, 16]} justify="center">
      <Col className={styles.report} style={{ transform }}>
        <Report
          data={userReport.report}
          results={userReport.results}
          campaign={JSON.stringify({})}
          user={JSON.stringify(userReport.user)}
          locales={userReport.report.locales}
          selectedLocale={userReport.report.defaultLanguage}
          userReport={userReport}
          dashboard
        />
      </Col>
    </Row>
  )

  return (
    <>
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown locales={locales} current={current} />
        </Col>
      </PageHeader>
      <InsightsHeader />
      {isMobile
        ? <InsightsMobileView report={report} />
        : (
          <InsightsDesktopView report={report} userReport={userReport} />
        )}
    </>
  )
}

export const Insights = connector(InsightsComponent)
