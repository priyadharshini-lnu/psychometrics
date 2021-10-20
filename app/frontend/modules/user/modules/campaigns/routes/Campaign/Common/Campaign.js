import React, { useState } from 'react'
import {
  Layout, Row, Col, Alert, List, Avatar, Button, Result, Tooltip,
} from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { STATUSES } from 'constants/campaign'
import './styles.scss'
import cs from 'classnames'
import { useMedia } from 'modules/user/rootHooks'
import { isInsideIframe } from 'utils/isInsideIframe'
import Assessments from './Assessments'
import Header from './Header'
import InstructionsPanel from './InstructionsPanel'
import { Statuses } from '../../../core/userAssessment/interfaces'

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
  loginHogan, acceptPolicy, fetchCampaign, beginCampaign, continueCampaign,
}) {
  const [showError, setShowError] = useState(false)

  const {
    isTimedCampaign,
    campaignsCount,
    campaignUser: {
      expiryDate,
    },
    campaignOptions: {
      instructionsEnabled,
      instructions,
      proctoringEnabled,
    },
  } = campaign
  const needsProctoring = proctoringEnabled && !isInsideIframe()
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  // TODO: We can check completion_status here. Also need to take care for assessment timed_out status when we add it
  const allAssessmentsComplete = counters.completed === campaign.userAssessments.length
  let prevGroup
  let ungrouped = _.compact(
    campaign.ungroupedAssessmentsIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
  )
  const isMD = useMedia('max-md')
  const hasAssessments = !!campaign.userAssessments.length
  const hasStartedCampaign = !!campaignUser.startedAt
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const canNotStartAssessment = needsProctoring || !hasStartedCampaign || campaignClosed
    || campaignUser.status === 'completed' || isCampaignInterrupted || campaignUserTimedOut
  const canBeginCampaign = !campaignClosed && hasAssessments && !hasStartedCampaign
  const canContinueCampaign = ((needsProctoring && !canBeginCampaign) || isCampaignInterrupted)
    && !campaignClosed && !allAssessmentsComplete && !campaignUserTimedOut
  const showTimer = isTimedCampaign && hasStartedCampaign && !isCampaignInterrupted
    && campaignUser.status !== 'completed'
  const showCampaignClosedMessage = campaignClosed || campaignUserTimedOut
    || (isTimedCampaign && campaignUser.status === 'completed')

  const onBeginCampaign = () => {
    beginCampaign(campaignUser.id).then(({ response: { examusSessionUrl } }) => {
      if (proctoringEnabled && examusSessionUrl) { window.location = examusSessionUrl }
    }).catch((error) => {
      setShowError(error)
    })
  }

  const onContinueCampaign = () => {
    continueCampaign(campaignUser.id).then(({ response: { examusSessionUrl } }) => {
      if (proctoringEnabled && examusSessionUrl) { window.location = examusSessionUrl }
    }).catch((error) => {
      setShowError(error)
    })
  }

  const onTimerFinish = () => {
    fetchCampaign(match.url)
  }

  const isAnyAssessmentInPreviousGroupInEligible = (group) => {
    if (!group) { return false }
    return _.find(
      campaign.userAssessments,
      ua => _.includes(group.campaignAssessmentIds, ua.assessmentId) && ua.status === Statuses.INELIGIBLE,
    )
  }

  const allCampaignLevelAsssementIds = _.flatten(
    [...groups.map(g => g.campaignAssessmentIds), campaign.ungroupedAssessmentsIds],
  )

  const ungroupedAssessments = campaign.userAssessments.filter(
    ua => !_.includes(allCampaignLevelAsssementIds, ua.assessmentId),
  )
  ungrouped = [...ungrouped, ...ungroupedAssessments]
  const hasSidebar = !!userReports.length

  return (
    <Layout>
      <Content className="fluid-container common-campaign">
        <Row justify="center">
          <Col xs={24} lg={22} xl={22} xxl={22}>
            <div className="main-content">
              <>
                <Header
                  counters={counters}
                  expiryDate={expiryDate}
                  currentUser={currentUser}
                  onFinish={onTimerFinish}
                  showTimer={showTimer}
                />
                {allAssessmentsComplete && (
                  <Result
                    status="success"
                    title={I18n.t('campaign.thank_you_for_time')}
                    subTitle={
                      campaignsCount > 1
                        ? I18n.t('campaign.all_activities_are_completed_multiple')
                        : I18n.t('campaign.all_activities_are_completed')
                    }
                    extra={campaignsCount > 1 && (
                      <Button href="/" type="primary">
                        {I18n.t('campaign.goto_dashboard')}
                      </Button>
                    )}
                    className="custom-result mvl"
                  />
                )}
                {showCampaignClosedMessage && (
                  <div className="mvm font-bold">
                    <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
                  </div>
                )}
                <InstructionsPanel
                  instructionsEnabled={instructionsEnabled}
                  instructions={instructions}
                  showBegin={canBeginCampaign}
                  showContinue={canContinueCampaign}
                  proctoringEnabled={proctoringEnabled}
                  enoughProctoringCredits={!showError}
                  onBegin={onBeginCampaign}
                  onContinue={onContinueCampaign}
                />
                <Row className="cards-container" gutter={16}>
                  <Col flex="2 0 33.3%" className={cs({ disabled: canNotStartAssessment })}>
                    <div className="panel-label">{I18n.t('campaign.panels.assessments')}</div>
                    <Row gutter={[16, 16]}>
                      {groups.map((group) => {
                        const size = group.campaignAssessmentIds.length
                        let colSize = 24
                        let prevCompleted = false
                        let previousAssessmentIsIneligible = false
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
                          if (isAnyAssessmentInPreviousGroupInEligible(prevGroup)) { return null }
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
                                  let isDisabled = canNotStartAssessment || prevCompleted
                                  if (!isDisabled && group.previousAssessmentsRequired) {
                                    isDisabled = prevAssessmentsCompleted(userAssessments, userAssessment)
                                    if (previousAssessmentIsIneligible) { return null }
                                  }
                                  previousAssessmentIsIneligible = userAssessment.status === Statuses.INELIGIBLE
                                  return (
                                    <Assessment
                                      key={userAssessment.id}
                                      history={history}
                                      userAssessment={userAssessment}
                                      size={size}
                                      withSidebar={hasSidebar}
                                      loginHogan={loginHogan}
                                      acceptPolicy={acceptPolicy}
                                      disabled={isDisabled}
                                      isPartOfTimedCampaign={isTimedCampaign}
                                      campaignExpiryDate={expiryDate}
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
                                    withSidebar={hasSidebar}
                                    loginHogan={loginHogan}
                                    acceptPolicy={acceptPolicy}
                                    disabled={canNotStartAssessment}
                                    isPartOfTimedCampaign={isTimedCampaign}
                                    campaignExpiryDate={expiryDate}
                                  />
                                )
                              })}
                            </Row>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Col>
                  {userReports.length !== 0 && (
                    <Col flex="1">
                      <div className="panel-label">{I18n.t('campaign.panels.reports')}</div>
                      <List
                        bordered
                        className="reports-list"
                        dataSource={userReports}
                        renderItem={item => (
                          <List.Item>
                            <div className="report-row">
                              <div className="report-item">
                                <Avatar className="report-icon me-4">{item.reportName[0]}</Avatar>
                                <div className="report-title">
                                  <div>{item.reportName}</div>
                                </div>
                                <Tooltip title={I18n.t(`user_reports.readable_statuses.${item.status}`)}>
                                  <Button
                                    type="link"
                                    href={item.status === 'prepared' ? item.pdfUrl : ''}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    disabled={item.status !== 'prepared'}
                                    icon={<DownloadOutlined />}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Col>
                  )}
                </Row>
              </>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
