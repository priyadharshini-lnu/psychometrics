/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Typography, Row, Col, PageHeader, Progress,
} from 'antd'
import _ from 'lodash'
import Nominations from './NominationList'
import Evaluations from './EvaluationList'
import Reports from './ReportList'
import './styles.scss'

const { Paragraph } = Typography
const { Content } = Layout

export default function Campaign ({
  history, match, fetchCampaign, instructions, 
  evaluationsCounters, nominationsCounters, reportsCounters
}) {
  useEffect(() => {
    fetchCampaign(match.params.campaignId)
  }, [])

  const welcomeMessage = _.find(instructions, { name: 'welcome_message' })
  const nominationsPercent = (nominationsCounters.completedEvaluations / nominationsCounters.totalEvaluations) * 100
  const evaluationsPercent = (evaluationsCounters.completedEvaluations / evaluationsCounters.totalEvaluations) * 100
  const reportsPercent = 0
  return (
    <Layout>
      <Content className="fluid-container">
        <div className="main-container">
          <PageHeader
            className="page-header"
            onBack={() => history.push('/campaigns')}
            title={<div className="title-with-dash">{I18n.t('threesixty.page_title')}</div>}
          >
            <div className="content padding">
              {welcomeMessage ? (
                <Row type="flex">
                  <div dangerouslySetInnerHTML={{ __html: welcomeMessage.content }} />
                </Row>
              ) : (
                <Row type="flex">
                  <Paragraph>
                      Welcome to the 360 Degree Assessment at Signify. Your feedback is appreciated!
                  </Paragraph>
                  <Paragraph>
                      Please respond to the questions open and honestly and remember your individual responses are confidential.
                  </Paragraph>
                  <Paragraph>
                      If you have any questions regarding the 360 Degree process, please visit www.signify360.com or contact (email id here)
                  </Paragraph>
                  <Paragraph>
                      Incase you experience any technical difficulties, please contact signify360@thetalententerprise.com
                  </Paragraph>
                  <Paragraph>
                      Thank you for your participation!
                  </Paragraph>
                </Row>
              )}

              <Row gutter={16} className="progress-wrapper">
                <Col xs={{ span: 32 }} lg={{ span: 16 }}>
                  <div className="progress-column">
                    <Progress
                      strokeColor="#00B4AA"
                      percent={nominationsPercent}
                      strokeWidth={16}
                      format={percent => (
                        <div className="percentage">{`${percent}%`}</div>
                      )}
                    />
                    <div className="progress-label">{I18n.t('threesixty.total_progress')}</div>
                  </div>
                </Col>
                <Col xs={{ span: 32 }} lg={{ span: 8 }}>
                  <div className="progresses">
                    <div className="mini-progress">
                      <div className="letter-icon">N</div>
                      <Progress
                        className="progress-line"
                        percent={evaluationsPercent}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="mini-progress">
                      <div className="letter-icon">E</div>
                      <Progress
                        className="progress-line"
                        percent={evaluationsPercent}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="mini-progress">
                      <div className="letter-icon">R</div>
                      <Progress
                        className="progress-line"
                        percent={reportsPercent}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <Row type="flex" gutter={16} className="task_cards">
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Nominations percent={nominationsPercent} />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Evaluations history={history} percent={evaluationsPercent} />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Reports percent={reportsPercent} />
              </Col>
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
