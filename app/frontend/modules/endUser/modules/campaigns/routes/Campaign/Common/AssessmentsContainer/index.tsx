import _ from 'lodash'
import { Col, Row, Typography } from 'antd'

import Assessments from '~/modules/endUser/modules/campaigns/routes/Campaign/Common/Assessments'

import { Statuses, UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { ViewsContainer } from '~/glint'
import styles from './AssessmentsContainer.less'

const { Title } = Typography
const { I18n } = window

const prevAssessmentsCompleted = (userAssessments: UserAssessment[], userAssessment: UserAssessment) => {
  if (userAssessments.length === 1) {
    return true
  }
  const prevs = _.take(userAssessments, _.findIndex(userAssessments, userAssessment))
  return (prevs.length === 0) || _.every(prevs, ua => ua.status === 'completed')
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
  ungrouped,
  groups,
  canNotStartAssessment,
  campaign,
  loginHogan,
  acceptPolicy,
  isTimedCampaign,
  expiryDate,
  campaignNotStarted,
}) => (
  <ViewsContainer
    title={I18n.t('campaign_assessment.assessments_heading')}
    defaultView="grid"
    viewTypeStorageKey="asessmentListingType"
  >
    {(view) => {
      let tabCol = 12
      let deskCol = 8
      if (view === 'list') {
        tabCol = 24
        deskCol = 24
      }
      let prevGroup
      return (
        <>
          {groups.map((group) => {
            const size = group.campaignAssessmentIds.length
            let prevCompleted = true
            let previousAssessmentIsIneligible = false
            if (group.previousGroupRequired) {
              prevCompleted = prevGroupIsCompleted(campaign, prevGroup)
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
              <div className={styles.group} key={group.id}>
                <Title level={5}>{group.name}</Title>
                <Row gutter={[16, 16]}>
                  {userAssessments.map((userAssessment) => {
                    const Assessment = Assessments[userAssessment.type]
                    const isDisabled = canNotStartAssessment || !prevCompleted
                    if (!isDisabled && group.previousAssessmentsRequired) {
                      prevCompleted = prevAssessmentsCompleted(userAssessments, userAssessment)
                      if (previousAssessmentIsIneligible) {
                        return null
                      }
                    }
                    previousAssessmentIsIneligible = userAssessment.status === Statuses.INELIGIBLE
                    return (
                      <Col xs={24} sm={tabCol} md={tabCol} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                        <Assessment
                          view={view}
                          history={history}
                          userAssessment={userAssessment}
                          size={size}
                          loginHogan={loginHogan}
                          acceptPolicy={acceptPolicy}
                          disabled={canNotStartAssessment || !prevCompleted}
                          prevCompleted={prevCompleted}
                          campaignNotStarted={campaignNotStarted}
                          isPartOfTimedCampaign={isTimedCampaign}
                          campaignExpiryDate={expiryDate}
                        />
                      </Col>
                    )
                  })}
                </Row>
              </div>
            )
          })}
          {!!ungrouped.length && (
          <div className={styles.group}>
            {groups.length > 0 && (
              <Title level={5}>{I18n.t('campaign_assessment.ungrouped_assessments_heading')}</Title>
            )}
            <Row gutter={[16, 16]}>
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
                      campaignNotStarted={campaignNotStarted}
                      prevCompleted
                      isPartOfTimedCampaign={isTimedCampaign}
                      campaignExpiryDate={expiryDate}
                    />
                  </Col>
                )
              })}
            </Row>
          </div>
          )}
        </>
      )
    }}
  </ViewsContainer>
)
