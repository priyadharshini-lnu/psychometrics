import _ from 'lodash'
import {
  Col, Row, Typography, Space, Alert,
  Button,
} from 'antd'
import cs from 'classnames'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssessmentCard } from '../AssessmentCard'
import { AssessmentCardContainer } from '../AssessmentCardContainer'
import { InviteDeatilsContainer } from './InviteDetailsContainer'
import { BreakCard } from './BreakCard'
import { Statuses, UserAssessment } from '~/modules/endUser/modules/campaigns/core/userAssessment/interfaces'
import { DirectionalNavigateBackIcon, ViewsContainer } from '~/glint'
import styles from './AssessmentsContainer.less'
import { isProctored } from '~/utils/isProctored'

const { Title } = Typography
const { I18n } = window

const prevAssessmentsCompleted = (userAssessments: UserAssessment[], userAssessment: UserAssessment) => {
  if (userAssessments.length === 1) {
    return true
  }
  const prevs = _.take(userAssessments, _.findIndex(userAssessments, userAssessment))
  return (prevs.length === 0) || _.every(prevs, ua => ua.status === 'completed')
}

const prevGroupIsCompleted = (userAssessments, group) => {
  if (!group) {
    return true
  }
  return _.every(userAssessments, ua => ua.status === 'completed')
}

const isAnAssessmentCenterGroup = group => group?.groupType === 'assessment_center'

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
  canNotStartWorkshopActivity,
  campaign,
  campaignNotStarted,
  canNotStartPrework,
}) => {
  const { search } = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(search)
  const assessmentCenterIdFromUrl = searchParams.get('assessmentCenterId')
  const showAssessmentCenterDetails = !!assessmentCenterIdFromUrl
  let assessmentGroups = groups.map((group) => {
    if (!showAssessmentCenterDetails) return group
    if (group.id === parseInt(assessmentCenterIdFromUrl, 10)) return { ...group, hide: false }
    return { ...group, hide: true }
  })
  const inviteDetails = campaign.workshopInvite
  const { workshops: campaignWorkshops } = campaign

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
    <>
      <title>
        {
          `${I18n.t('campaign.dashboard_menu.campaign')} ${I18n.t('campaign.dashboard_menu.tasks')}
          - ${I18n.t('frontend.lighthouse_app')}`
        }
      </title>
      {assessmentCenterIdFromUrl && (
        <AssessmentCardContainer className="mt-0 pt-0">
          <Button
            onClick={() => navigate(`/campaigns/${campaign.id}`)}
            icon={<DirectionalNavigateBackIcon className="fs-12" />}
          >
            {I18n.t('common.actions.view_all_tasks')}
          </Button>
        </AssessmentCardContainer>
      )}
      <ViewsContainer
        title={assessmentCenterIdFromUrl
          ? I18n.t('campaign_assessment.assessment_center_heading') : I18n.t('campaign_assessment.assessments_heading')}
        titleHeadingLevel={1}
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
            <Space direction="vertical" className="w-100">
              {assessmentGroups.map((group) => {
                if (group.hide) {
                  return null
                }
                let prevCompleted = true
                let previousAssessmentIsIneligible = false
                const isAssessmentCenter = isAnAssessmentCenterGroup(group)
                const isPreviousGroupAnAssessmentCenter = isAnAssessmentCenterGroup(prevGroup)
                const showAssessentCenterDetailsLink = isAssessmentCenter && !showAssessmentCenterDetails
                const groupTitleId = `camp-group-${group.id}`

                if (group.previousGroupRequired) {
                  const userAssessments: UserAssessment[] = isPreviousGroupAnAssessmentCenter ? workshopActivities : _
                    .filter(
                      campaign.userAssessments,
                      ua => _.includes(prevGroup?.campaignAssessmentIds, ua.assessmentId),
                    )
                  prevCompleted = prevGroupIsCompleted(userAssessments, prevGroup)
                  if (isAnyAssessmentInPreviousGroupInEligible(campaign, prevGroup)) {
                    return null
                  }
                }
                prevGroup = group
                let userAssessments: UserAssessment[] = _.compact(
                  group.campaignAssessmentIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
                )
                let proctoringMsgOnWorkshop = ''
                const workshop = isAssessmentCenter
                  ? campaignWorkshops.find(workshop => workshop.campaignAssessmentGroupId === group.id) || {} : {}
                const alignCardItemsInCenter = showAssessentCenterDetailsLink && !_.isEmpty(workshop)
                const workshopCompleted = workshop ? workshop.completed : false
                const workshopAttended = workshop ? workshop.attended : false
                if (isAssessmentCenter) {
                  proctoringMsgOnWorkshop = getProctoringMsgOnWorkshop(
                    campaign.campaignOptions || {}, canNotStartWorkshopActivity,
                  )
                  if (workshop?.closed) return
                  if (workshopCompleted) {
                    userAssessments = []
                  }
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
                    className={styles.group}
                    key={group.id}
                  >
                    <AssessmentCardContainer
                      className={cs({
                        [styles.assessmentCenter]: isAssessmentCenter,
                        'ta-c': alignCardItemsInCenter,
                      })}
                    >
                      <Title id={groupTitleId} className="mt-0" level={5}>{group.name}</Title>
                      <Space
                        align={(alignCardItemsInCenter) ? 'center' : undefined}
                        direction="vertical"
                        size="middle"
                        className="w-100"
                      >
                        {showAssessentCenterDetailsLink ? (
                          <InviteDeatilsContainer
                            inviteDetails={inviteDetails}
                            bookingDetails={workshop}
                            groupId={group.id}
                            groupTitleId={groupTitleId}
                          />
                        ) : null}
                        {proctoringMsgOnWorkshop && <Alert message={proctoringMsgOnWorkshop} showIcon />}
                        {showAssessentCenterDetailsLink
                          ? null : (
                            <Row gutter={[16, 16]}>
                              {userAssessments.map((userAssessment, index) => {
                                let isDisabled = userAssessment.prework ? canNotStartPrework : canNotStartAssessment
                                if (isAssessmentCenter) {
                                  isDisabled = canNotStartWorkshopActivity
                                }
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
                                    {/* eslint-disable-next-line max-len */}
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
                          )}
                      </Space>
                    </AssessmentCardContainer>
                  </div>
                )
              })}
              {!!ungroupedAssessments.length && !showAssessmentCenterDetails && (
                <div className={styles.group}>
                  <AssessmentCardContainer>
                    {groups.length > 0 && (
                      <Title
                        className="mt-0"
                        level={5}
                      >
                        {I18n.t('campaign_assessment.ungrouped_assessments_heading')}
                      </Title>
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
            </Space>
          )
        }}
      </ViewsContainer>
    </>
  )
}

const getProctoringMsgOnWorkshop = (campaignOptions, canNotStartWorkshopActivity) => {
  if (!campaignOptions.proctoringEnabled) return null

  if (!campaignOptions.proctoringEnabledOnWorkshopActivity) {
    if (isProctored()) {
      return I18n.t('campaign_assessment.not_allow_msg_proctoring_workshop_activity')
    } if (!canNotStartWorkshopActivity) {
      return I18n.t('campaign_assessment.allow_msg_proctoring_workshop_activity')
    }
  }

  return ''
}
