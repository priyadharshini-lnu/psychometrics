import React, {
  FC, useEffect, useContext,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Row, Col, Layout, Typography, Tabs, Space,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import _ from 'lodash'
import { useReportDimensions } from '~/hooks/useReportDimensions'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchInsights, getReports, getUserDashboard, FETCH_INSIGHTS,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import Report from '~/modules/reports/report'
import { SubHeader } from '~/modules/endUser/modules/campaigns/components/SubHeader'
import { isRequestInProgress } from '~/core/request'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { MediaQueryContext, PageHeader, FontsizeModifier } from '~/glint'
import { ReportList } from './ReportList'

import styles from './styles.less'
import { PageContentSkeleton } from '../../components/PageContentSkeleton'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window
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
  campaignId: string
}
type Props = PropsFromRedux

const InsightsComponent: FC<Props> = ({
  userDashboard, fetchInsights, isUserReportAvailable, isInsightLoading,
}) => {
  const navigate = useNavigate()
  const { campaignId } = useParams() as Params

  useEffect(() => {
    fetchInsights(`/campaigns/${campaignId}/insights`)
  }, [campaignId])

  return (
    <>
      <DocumentTitle text={I18n.t('campaign.dashboard_menu.insights')} />
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <Space>
            <FontsizeModifier />
            <LangDropdownWithChangeLocale />
          </Space>
        </Col>
      </PageHeader>
      <Content className={styles.pageContent}>
        {isInsightLoading ? <PageContentSkeleton /> : (
          <>
            <SubHeader
              title={I18n.t('campaign.dashboard_menu.insights')}
              onBack={() => navigate('/dashboard')}
              backButtonAriaLabel={I18n.t('frontend.aria.back_to_dashboard')}
            />
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
  const {
    containerRef, reportRef, scale, reportSize,
  } = useReportDimensions()

  const report = userDashboard && (
    <Row justify="center">
      <Col xs={24} ref={containerRef} className={styles.reportOuter} style={{ height: reportSize.height || 'auto' }}>
        <div ref={reportRef} className={styles.reportInner} style={{ transform: `scale(${scale})` }}>
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
        </div>
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
