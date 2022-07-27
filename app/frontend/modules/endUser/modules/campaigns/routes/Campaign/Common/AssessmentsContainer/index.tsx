import _ from 'lodash'
import React from 'react'
import { Col, Row, Typography } from 'antd'

import { ViewsContainer } from 'glint'
import Assessments from 'modules/endUser/modules/campaigns/routes/Campaign/Common/Assessments'

import { Statuses, UserAssessment } from 'modules/user/modules/campaigns/core/userAssessment/interfaces'


const { Title } = Typography

const prevAssessmentsCompleted = (userAssessments: UserAssessment[], userAssessment: UserAssessment) => {
  const prevs = _.take(userAssessments, _.findIndex(userAssessments, userAssessment))
  return !!prevs.length && _.some(prevs, ua => ua.status !== 'completed')
}

const prevGroupIsCompleted = (campaign, group) => {
  if (!group) {
    return true
  }
  const userAssessments = _
    .filter(campaign.userAssessments, ua => _.includes(group.campaignAssessmentIds, ua.assessmentId))
  return _.every(userAssessments, ua => ua.status === 'completed')
}

const isAnyAssessmentInPreviousGroupInEligible = (campaign, group) => {
  if (!group) {
    return false
  }
  return _.find(
    campaign.userAssessments,
    ua => _.includes(group.campaignAssessmentIds, ua.assessmentId) && ua.status === Statuses.INELIGIBLE,
  )
}

export const AssessmentsContainer = ({
  ungrouped, groups, canNotStartAssessment, campaign, loginHogan, acceptPolicy, isTimedCampaign, expiryDate,
}) => (
  <ViewsContainer title="Your Tasks">
    {(view) => {
      let tabCol = 12
      let deskCol = 8
      if (view === 'list') {
        tabCol = 24
        deskCol = 24
      }
      return (
        <>
          <Row gutter={[16, 16]} key="grouped-tasks">
            {groups.map((group) => {
              let prevGroup
              const size = group.campaignAssessmentIds.length
              let prevCompleted = false
              let previousAssessmentIsIneligible = false
              if (group.previousGroupRequired) {
                prevCompleted = !prevGroupIsCompleted(campaign, prevGroup)
                if (isAnyAssessmentInPreviousGroupInEligible(campaign, prevGroup)) {
                  return null
                }
              }
              prevGroup = group
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const userAssessments: any = _.compact(
                group.campaignAssessmentIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
              )

              if (!userAssessments.length) {
                return null
              }
              return (
                <React.Fragment key={group.id}>
                  <Col span={24}>
                    <Title level={5}>{group.name}</Title>
                  </Col>
                  {userAssessments.map((userAssessment) => {
                    const Assessment = Assessments[userAssessment.type]
                    let isDisabled = canNotStartAssessment || prevCompleted
                    if (!isDisabled && group.previousAssessmentsRequired) {
                      isDisabled = prevAssessmentsCompleted(userAssessments, userAssessment)
                      if (previousAssessmentIsIneligible) {
                        return null
                      }
                    }
                    previousAssessmentIsIneligible = userAssessment.status === Statuses.INELIGIBLE
                    return (
                      <Col xs={24} sm={24} md={24} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                        <Assessment
                          view={view}
                          history={history}
                          userAssessment={userAssessment}
                          size={size}
                          loginHogan={loginHogan}
                          acceptPolicy={acceptPolicy}
                          disabled={isDisabled}
                          isPartOfTimedCampaign={isTimedCampaign}
                          campaignExpiryDate={expiryDate}
                        />
                      </Col>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </Row>
          <Row gutter={[16, 16]} key="ungrouped-tasks">
            {!!ungrouped.length && (
              <>
                <Col span={24}>
                  <Title level={5}>Ungrouped</Title>
                </Col>
                  {ungrouped.map((userAssessment) => {
                    const Assessment = Assessments[userAssessment.type]
                    return (
                      <Col xs={24} sm={24} md={24} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                        <Assessment
                          history={history}
                          view={view}
                          userAssessment={userAssessment}
                          loginHogan={loginHogan}
                          acceptPolicy={acceptPolicy}
                          disabled={canNotStartAssessment}
                          isPartOfTimedCampaign={isTimedCampaign}
                          campaignExpiryDate={expiryDate}
                        />
                      </Col>
                    )
                  })}
              </>
            )}
          </Row>
        </>
      )
    }}
  </ViewsContainer>
)
