/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React from 'react'
import {
  Layout, Row, Col, Alert, List, Avatar, Button, Tag,
} from 'antd'
import {
  FileAddOutlined, HistoryOutlined, CheckCircleOutlined, ArrowDownOutlined,
} from '@ant-design/icons'
import { STATUSES } from 'constants/campaign'
import './styles.scss'
import cs from 'classnames'
import { useMedia } from 'modules/user/rootHooks'
import Assessments from './Assessments'

const { Content } = Layout

const prevAssessmentsCompleted = (userAssessments, userAssessment) => {
  const prevs = _.take(userAssessments, _.findIndex(userAssessments, userAssessment))
  return !!prevs.length && _.some(prevs, ua => ua.status !== 'completed')
}

const prevGroupIsCompleted = (campaign, group) => {
  if (!group) { return false }
  const userAssessments = _.filter(campaign.userAssessments, ua => _.includes(group.campaignAssessmentIds, ua.assessmentId))
  return _.every(userAssessments, ua => ua.status === 'completed')
}

export default function Campaign ({
  history, campaign, campaign: { userReports, groups }, currentUser,
  loginHogan, acceptPolicy,
}) {
  const camapaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  let prevGroup
  const groupAssessments = _.reduce(groups, (arr, group) => ([...arr, ...group.campaignAssessmentIds]), [])
  const ungrouped = _.filter(campaign.userAssessments, ua => !_.includes(groupAssessments, ua.assessmentId))
  const isMD = useMedia('max-md')

  return (
    <Layout>
      <Content className="fluid-container common-campaign">
        <Row justify="center">
          <Col xs={24} lg={22} xl={22} xxl={22}>
            <div className="main-content">
              <>
                <div className="campaign-header">
                  <div className="left">
                    <h2>
                      {I18n.t('campaign.welcome_back')}
                      {' '}
                      {currentUser.fullName}
                      !
                    </h2>
                  </div>
                  <div className="right-wrapper">
                    <div className="right">
                      <div className="item">
                        <div className="icon">
                          <FileAddOutlined />
                        </div>
                        <div className="number">{counters.not_started || 0}</div>
                        <div className="label">{I18n.t('campaign.new')}</div>
                      </div>
                      <div className="divider" />
                      <div className="item">
                        <div className="icon">
                          <HistoryOutlined />
                        </div>
                        <div className="number">{counters.in_progress || 0}</div>
                        <div className="label">{I18n.t('campaign.in_progress')}</div>
                      </div>
                      <div className="divider" />
                      <div className="item">
                        <div className="icon">
                          <CheckCircleOutlined />
                        </div>
                        <div className="number">{counters.completed || 0}</div>
                        <div className="label">{I18n.t('campaign.completed')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {camapaignClosed && (
                  <div className="mbm font-bold">
                    <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
                  </div>
                )}
                <Row className="cards-container" gutter={16}>
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
                        const userAssessments = _.filter(campaign.userAssessments, ua => _.includes(group.campaignAssessmentIds, ua.assessmentId))
                        if (!userAssessments.length) { return null }
                        return (
                          <Col xs={24} sm={colSize} lg={colSize} xl={colSize}>
                            <div className={cs('group')}>
                              <div className="group-title">{group.name}</div>

                              <Row type="flex" gutter={[16, 16]} className="cards">
                                {userAssessments.map((userAssessment) => {
                                  const Assessment = Assessments[userAssessment.type]
                                  let isDisabled = prevCompleted
                                  if (!isDisabled && group.previousAssessmentsRequired) {
                                    isDisabled = prevAssessmentsCompleted(userAssessments, userAssessment)
                                  }
                                  return (
                                    <Assessment
                                      history={history}
                                      userAssessment={userAssessment}
                                      size={size}
                                      loginHogan={loginHogan}
                                      acceptPolicy={acceptPolicy}
                                      disabled={isDisabled}
                                    />
                                  )
                                })}
                              </Row>
                            </div>
                          </Col>
                        )
                      })}
                      {ungrouped.length && (
                        <Col xs={24} sm={24} lg={24} xl={24}>
                          <div className={cs('group')}>
                            <div className="group-title">{I18n.t('campaign.ungrouped')}</div>

                            <Row type="flex" gutter={[16, 16]} className="cards">
                              {ungrouped.map((userAssessment) => {
                                const Assessment = Assessments[userAssessment.type]
                                return (
                                  <Assessment
                                    history={history}
                                    userAssessment={userAssessment}
                                    size={3}
                                    loginHogan={loginHogan}
                                    acceptPolicy={acceptPolicy}
                                    disabled={false}
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
