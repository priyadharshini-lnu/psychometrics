import _ from 'lodash'
import {
  Col, Row, Typography, Space,
} from 'antd'
import cs from 'classnames'
import { AssessmentCard } from '../AssessmentCard'
import { AssessmentCardContainer } from '../AssessmentCardContainer'
import { InviteDeatilsContainer } from './InviteDetailsContainer'
import { BreakCard } from './BreakCard'

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

const createAssessmentCenterGroup = () => ({
  id: 'dummy_group',
  groupType: 'assessment_center',
  name: I18n.t('frontend.bookings.assessment_center_group_name'),
})

const removeWorkshopActivities = assessments => assessments.filter(assessment => !assessment?.workshopActivity)

export const AssessmentsContainer = ({
  ungrouped,
  groups,
  canNotStartAssessment,
  campaign,
  campaignNotStarted,
  canNotStartPrework,
}) => {
  let assessmentGroups = [...groups]
  const inviteDetails = campaign.workshopInvite
  const { workshop } = campaign
  const workshopCompleted = workshop ? workshop.completed : false
  const workshopAttended = workshop ? workshop.attended : false
  let workshopActivities = campaign.userAssessments
    .filter(assessment => assessment?.workshopActivity && !assessment?.prework)
  workshopActivities = _.sortBy(workshopActivities, wa => wa.scheduleTime)

  const hasAssessmentCenterGroup = _.find(assessmentGroups, { groupType: 'assessment_center' })
  if (!hasAssessmentCenterGroup && workshopActivities.length) {
    const dummyAssessmentGroup = createAssessmentCenterGroup()
    assessmentGroups = [...assessmentGroups, dummyAssessmentGroup]
  }
  const ungroupedAssessments = workshopActivities.length ? removeWorkshopActivities(ungrouped) : ungrouped

  return (
    <ViewsContainer
      title={I18n.t('campaign_assessment.assessments_heading')}
      defaultView="grid"
      viewTypeStorageKey="assessmentListingType"
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
            {assessmentGroups.map((group) => {
              let prevCompleted = true
              let previousAssessmentIsIneligible = false
              const isAssessmentCenter = group.groupType === 'assessment_center'

              if (group.previousGroupRequired) {
                prevCompleted = prevGroupIsCompleted(campaign, prevGroup)
                if (isAnyAssessmentInPreviousGroupInEligible(campaign, prevGroup)) {
                  return null
                }
              }
              prevGroup = group
              let userAssessments: UserAssessment[] = []
              if (isAssessmentCenter) {
                if (workshop?.closed) return
                userAssessments = workshopCompleted ? [] : workshopActivities
              } else {
                userAssessments = _.compact(
                  group.campaignAssessmentIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
                )
                userAssessments = workshopActivities.length
                  ? removeWorkshopActivities(userAssessments) : userAssessments
              }
              if (!userAssessments?.length) {
                return null
              }

              return (
                <div
                  className={cs({ [styles.group]: true, [styles.assessmentCenter]: isAssessmentCenter })}
                  key={group.id}
                >
                  <AssessmentCardContainer>
                    <Title level={5}>{group.name}</Title>
                    <Space direction="vertical" size="middle" className="w-100">
                      {isAssessmentCenter ? (
                        <InviteDeatilsContainer inviteDetails={inviteDetails} bookingDetails={workshop} />
                      ) : null}
                      <Row gutter={[16, 16]}>
                        {userAssessments.map((userAssessment, index) => {
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
                            <>
                              <Col xs={24} sm={tabCol} md={tabCol} lg={tabCol} xl={deskCol} key={userAssessment.id}>
                                <AssessmentCard
                                  view={view}
                                  userAssessment={userAssessment}
                                  workshopBooked={!!workshop}
                                  workshopAttended={workshopAttended}
                                  disabled={isDisabled}
                                  prevCompleted={prevCompleted}
                                  campaignNotStarted={campaignNotStarted}
                                />
                              </Col>
                              {isAssessmentCenter && index < userAssessments.length - 1 ? (
                                <BreakCard
                                  currentWorkshopActivity={userAssessment}
                                  nextWorkshopActivity={userAssessments[index + 1]}
                                  tabCol={tabCol}
                                  deskCol={deskCol}
                                />
                              ) : null}
                            </>
                          )
                        })}
                      </Row>
                    </Space>
                  </AssessmentCardContainer>
                </div>
              )
            })}
            {!!ungroupedAssessments.length && (
            <div className={styles.group}>
              <AssessmentCardContainer>
                {groups.length > 0 && (
                <Title level={5}>{I18n.t('campaign_assessment.ungrouped_assessments_heading')}</Title>
                )}
                <Row gutter={[16, 16]}>
                  {ungroupedAssessments.map(userAssessment => (
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
}
