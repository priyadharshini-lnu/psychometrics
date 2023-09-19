import _ from 'lodash'
import { Col, Row, Typography } from 'antd'
import cs from 'classnames'

import { AssessmentCard } from '../AssessmentCard'
import { AssessmentCardContainer } from '../AssessmentCardContainer'

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
  campaignNotStarted,
  canNotStartPrework,
}) => (
  <ViewsContainer
    title={I18n.t('campaign_assessment.assessments_heading')}
    defaultView="grid"
    viewTypeStorageKey="asessmentListingType"
    className={styles.container}
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

            // TODO: assessment center is determined by using response from backend
            const isAssessmentCenter = false

            return (
              <div
                className={cs({ [styles.group]: true, [styles.assessmentCenter]: isAssessmentCenter })}
                key={group.id}
              >
                <AssessmentCardContainer>
                  <Title level={5}>{group.name}</Title>
                  <Row gutter={[16, 16]}>
                    {userAssessments.map((userAssessment) => {
                      let isDisabled = userAssessment.prework ? canNotStartPrework : canNotStartAssessment
                      isDisabled = isDisabled || !prevCompleted
                      if (!isDisabled && group.previousAssessmentsRequired) {
                        prevCompleted = prevAssessmentsCompleted(userAssessments, userAssessment)
                        isDisabled = isDisabled || !prevCompleted
                        if (previousAssessmentIsIneligible) {
                          return null
                        }
                      }
                      previousAssessmentIsIneligible = userAssessment.status === Statuses.INELIGIBLE
                      return (
                        <Col xs={24} sm={tabCol} md={tabCol} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                          <AssessmentCard
                            view={view}
                            userAssessment={userAssessment}
                            disabled={isDisabled}
                            prevCompleted={prevCompleted}
                            campaignNotStarted={campaignNotStarted}
                          />
                        </Col>
                      )
                    })}
                  </Row>
                </AssessmentCardContainer>
              </div>
            )
          })}
          {!!ungrouped.length && (
          <div className={styles.group}>
            <AssessmentCardContainer>
              {groups.length > 0 && (
              <Title level={5}>{I18n.t('campaign_assessment.ungrouped_assessments_heading')}</Title>
              )}
              <Row gutter={[16, 16]}>
                {ungrouped.map(userAssessment => (
                  <Col xs={24} sm={24} md={24} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                    <AssessmentCard
                      view={view}
                      userAssessment={userAssessment}
                      disabled={userAssessment.prework ? canNotStartPrework : canNotStartAssessment}
                      campaignNotStarted={campaignNotStarted}
                      prevCompleted
                    />
                  </Col>
                ))}
              </Row>
            </AssessmentCardContainer>
          </div>
          )}
        </>
      )
    }}
  </ViewsContainer>
)
