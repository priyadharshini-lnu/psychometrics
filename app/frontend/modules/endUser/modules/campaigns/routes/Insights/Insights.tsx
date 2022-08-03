import React, { FC, useEffect, useContext } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Row, Col, Layout } from 'antd'
import { RouteComponentProps } from 'react-router-dom'

import LangDropdown from 'components/LangDropdown'
import { MediaQueryContext, PageHeader } from 'glint'
import { RootState } from 'modules/user/core/rootReducers'
import {
  fetchInsights,
} from 'modules/user/modules/campaigns/core/campaign'
import Report from 'modules/reports/report'
import { InsightsHeader } from './InsightsHeader'

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

const InsightsComponent: FC<ComponentProps> = ({ match, userReport, fetchInsights }) => {
  useEffect(() => {
    fetchInsights(match.url)
  }, [match.url])
  const { isMobile } = useContext(MediaQueryContext)

  const width = isMobile ? window.innerWidth : window.innerWidth - 200
  const MAX = 1000
  const scale = width / MAX
  const offsetTop = (1 - scale) / 2 * 100
  const offsetLeft = isMobile ? ((1 - scale) / 3) * 105 : ((1 - scale) * (200 / window.innerWidth)) * 100
  const transform = scale < 1
    ? `translate(-${offsetLeft}%, -${offsetTop}%) scale(${scale})`
    : `translate(0, ${Math.abs(offsetTop)}%) scale(${scale})`

  return (
    <>
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown locales={locales} current={current} />
        </Col>
      </PageHeader>
      <Content className={styles.pageContent}>
        <InsightsHeader />
        <Row gutter={[0, 16]} justify="center">
          <Col style={{ transform }}>
            {userReport && (
            <Report
              data={userReport.report}
              results={userReport.results}
              campaign={JSON.stringify({})}
              user={JSON.stringify(userReport.user)}
              locales={userReport.report.locales}
              selectedLocale={userReport.report.defaultLanguage}
              userReport={userReport}
            />
            )}
          </Col>
        </Row>
      </Content>
    </>
  )
}

export const Insights = connector(InsightsComponent)
