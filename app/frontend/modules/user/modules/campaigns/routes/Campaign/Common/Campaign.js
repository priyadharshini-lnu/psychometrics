/* eslint-disable react/no-danger */
import React from 'react'
import {
  Layout, Row, Col, Alert, List, Avatar, Button, Tag, Result,
} from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { STATUSES } from 'constants/campaign'
import './styles.scss'
import cs from 'classnames'
import { useMedia } from 'modules/user/rootHooks'
import Assessments from './Assessments'
import Header from './Header'
import InstructionsPanel from './InstructionsPanel'

const { Content } = Layout

const prevAssessmentsCompleted = (userAssessments, userAssessment) => {
  const prevs = _.take(userAssessments, _.findIndex(userAssessments, userAssessment))
  return !!prevs.length && _.some(prevs, ua => ua.status !== 'completed')
}

const prevGroupIsCompleted = (campaign, group) => {
  if (!group) { return true }
  const userAssessments = _.filter(
    campaign.userAssessments,
    ua => _.includes(group.campaignAssessmentIds, ua.assessmentId),
  )
  return _.every(userAssessments, ua => ua.status === 'completed')
}

export default function Campaign ({
  history, match, campaign, campaign: { campaignUser, userReports, groups }, currentUser,
  loginHogan, acceptPolicy, beginCampaign, fetchCampaign,
}) {
  const {
    campaignUser: { startedAt },
    campaignOptions: {
      instructionsEnabled,
      instructions,
      fixedTime,
      fixedTimeDuration: duration,
    },
  } = campaign
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  const allAssessmentsComplete = counters.completed === campaign.userAssessments.length
  let prevGroup
  let ungrouped = _.compact(
    campaign.ungroupedAssessmentsIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
  )
  const isMD = useMedia('max-md')
  const hasStarted = !!campaignUser.startedAt
  const timeExtended = campaign

  const onBeginCampaign = () => {
    beginCampaign(campaignUser.id)
  }

  const onTimerFinish = () => {
    fetchCampaign(match.url)
  }

  const allCampaignLevelAsssementIds = _.flatten(
    [...groups.map(g => g.campaignAssessmentIds), campaign.ungroupedAssessmentsIds],
  )

  const ungroupedAssessments = campaign.userAssessments.filter(
    ua => !_.includes(allCampaignLevelAsssementIds, ua.assessmentId),
  )
  ungrouped = [...ungrouped, ...ungroupedAssessments]

  return (
    <Layout>
      <Content className="fluid-container common-campaign">
        <Row justify="center">
          <Col xs={24} lg={22} xl={22} xxl={22}>
            <div className="main-content">
              <>
                <Header
                  currentUser={currentUser}
                  counters={counters}
                  showTimer={!!fixedTime && hasStarted}
                  timerOptions={{ startedAt, duration }}
                  onFinish={onTimerFinish}
                />
                {allAssessmentsComplete && (
                  <Result
                    status="success"
                    title="Thank you for your time"
                    subTitle="All activities are now complete."
                    className="custom-result mvl"
                  />
                )}
                {campaignClosed && (
                  <div className="mvm font-bold">
                    <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
                  </div>
                )}
                <InstructionsPanel
                  instructionsEnabled={instructionsEnabled}
                  instructions={instructions}
                  showBegin={!hasStarted}
                  onBegin={onBeginCampaign}
                />
                <Row className={['cards-container', hasStarted ? '' : 'disabled']} gutter={16}>
                  <Col xs={24} lg={24} xl={18} xxl={18}>
                    <div className="panel-label">Assessments</div>
                    <Row gutter={[16, 16]}>
                      {groups.map((group) => {
                        const size = group.campaignAssessmentIds.length
                        let colSize = 24
                        let prevCompleted = false
                        if (size <= 2) {
                          colSize = size === 1 ? 8 : 16
                        }
                        if (isMD) {
                          if (size <= 2) {
                            colSize = size === 1 ? 12 : 24
                          }
                        }
                        if (group.previousGroupRequired) {
                          prevCompleted = !prevGroupIsCompleted(campaign, prevGroup)
                        }
                        prevGroup = group
                        const userAssessments = _.compact(
                          group.campaignAssessmentIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
                        )

                        if (!userAssessments.length) { return null }
                        return (
                          <Col xs={24} sm={colSize} lg={colSize} xl={colSize} key={group.id}>
                            <div className={cs('group')}>
                              <div className="group-title">{group.name}</div>

                              <Row type="flex" gutter={[16, 16]} className="cards">
                                {userAssessments.map((userAssessment) => {
                                  const Assessment = Assessments[userAssessment.type]
                                  let isDisabled = campaignClosed || prevCompleted
                                  if (!isDisabled && group.previousAssessmentsRequired) {
                                    isDisabled = prevAssessmentsCompleted(userAssessments, userAssessment)
                                  }
                                  return (
                                    <Assessment
                                      key={userAssessment.id}
                                      history={history}
                                      userAssessment={userAssessment}
                                      size={size}
                                      loginHogan={loginHogan}
                                      acceptPolicy={acceptPolicy}
                                      disabled={isDisabled}
                                      timer={{ fixedTime, startedAt, campaignDuration: duration }}
                                      disabledReason={campaignClosed
                                        ? I18n.t('campaign.campaign_closed_assessment_take_message')
                                        : I18n.t('campaign.complete_prev')
                                      }
                                    />
                                  )
                                })}
                              </Row>
                            </div>
                          </Col>
                        )
                      })}
                      {!!ungrouped.length && (
                        <Col xs={24} sm={24} lg={24} xl={24}>
                          <div className={cs('group')}>
                            <div className="group-title">{I18n.t('campaign.ungrouped')}</div>
                            <Row type="flex" gutter={[16, 16]} className="cards">
                              {ungrouped.map((userAssessment) => {
                                const Assessment = Assessments[userAssessment.type]
                                return (
                                  <Assessment
                                    key={userAssessment.id}
                                    history={history}
                                    userAssessment={userAssessment}
                                    size={3}
                                    loginHogan={loginHogan}
                                    acceptPolicy={acceptPolicy}
                                    disabled={campaignClosed}
                                    timer={{ fixedTime, startedAt, campaignDuration: duration }}
                                    disabledReason={I18n.t('campaign.campaign_closed_assessment_take_message')}
                                  />
                                )
                              })}
                            </Row>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Col>
                  <Col xs={24} lg={24} xl={6} xxl={6}>
                    <div className="panel-label">Reports</div>
                    <List
                      bordered
                      className="reports-list"
                      dataSource={userReports}
                      renderItem={item => (
                        <List.Item>
                          <div className="report-row">
                            <div className="report-item">
                              <Avatar className="report-icon">{item.reportName[0]}</Avatar>
                              <div className="report-title">
                                <div>{item.reportName}</div>
                                <div>
                                  {item.status === 'not_prepared' && (
                                    <Tag style={{ background: 'transparent' }}>
                                      {I18n.t('user_reports.statuses.not_prepared')}
                                    </Tag>
                                  )}
                                  {item.status === 'generating' && (
                                    <Tag color="blue" style={{ background: 'transparent' }}>
                                      {I18n.t('user_reports.statuses.generating')}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              {item.status === 'prepared' && (
                                <a
                                  href={item.pdfUrl}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  <Button type="link" icon={<ArrowDownOutlined />} />
                                </a>
                              )}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Col>
                </Row>
              </>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
