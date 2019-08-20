/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Row, Col, PageHeader, Progress,
} from 'antd'
import _ from 'lodash'
import Nominations from './NominationList'
import Evaluations from './EvaluationList'
import Reports from './ReportList'
import './styles.scss'

const { Content } = Layout

export default function Campaign ({
  history, match, fetchCampaign, instructions, campaign, nominations,
  evaluationsCounters, nominationsCounters, reportsCounters, totalProgress,
  loaded, resetCampaign,
}) {
  useEffect(() => {
    fetchCampaign(match.params.campaignId)

    return () => { resetCampaign() }
  }, [])

  if (!loaded) { return null }

  const nominationsPercent = (nominationsCounters.completedNominations / nominationsCounters.totalNominations) * 100
  const evaluationsPercent = (evaluationsCounters.completedEvaluations / evaluationsCounters.totalEvaluations) * 100
  const reportsPercent = (reportsCounters.completedReports / reportsCounters.totalReports) * 100

  let welcomeMessage = _.find(instructions, { name: 'welcome_message' })
  if (nominations === 0) {
    welcomeMessage = _.find(instructions, { name: 'evaluator_welcome' })
  }
  return (
    <Layout>
      <Content className="fluid-container">
        <div className="main-container">
          <PageHeader
            className="page-header"
            onBack={() => history.push('/campaigns')}
            title={<div className="title-with-dash">{campaign.name}</div>}
          >
            <div className="content padding">
              {welcomeMessage && (
                <Row type="flex">
                  <div dangerouslySetInnerHTML={{ __html: welcomeMessage.content }} />
                </Row>
              )}

              <Row gutter={16} className="progress-wrapper">
                <Col xs={{ span: 32 }} lg={{ span: 16 }}>
                  <div className="progress-column">
                    <Progress
                      strokeColor="#00B4AA"
                      percent={_.round(totalProgress)}
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
              {nominationsCounters.totalNominations !== 0
                && (
                <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                  <Nominations percent={nominationsPercent} />
                </Col>
                )}
              {evaluationsCounters.totalEvaluations !== 0
                && (
                <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                  <Evaluations history={history} percent={evaluationsPercent} />
                </Col>
                )}
              {reportsCounters.totalReports !== 0
                && (
                <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                  <Reports percent={reportsPercent} />
                </Col>
                )}
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
