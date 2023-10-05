import _ from 'lodash'
import { createSelector } from 'reselect'
import { get as getCurrentUser } from '~/core/currentUser'

export const get = state => _.get(state, ['campaigns', 'campaign'])
export const getUserAssessmentData = state => _.get(state, ['campaigns', 'userAssessment', 'userAssessmentData'])

export const getNominations = state => state.campaign.nominations
export const getEvaluations = state => state.campaign.evaluations
export const getManagedSubjects = state => state.campaign.managedSubjects
export const getReports = state => state.campaign.reports

export const getTotalProgress = (campaign) => {
  const {
    nominationsCounters: { completedNominations, totalNominations },
    evaluationsCounters: { completedEvaluations, totalEvaluations },
    reportsCounters: { completedReports, totalReports },
  } = campaign
  return (completedNominations + completedEvaluations + completedReports)
    / (totalNominations + totalEvaluations + totalReports) * 100
}

export const getApprovalNominations = createSelector(
  getNominations,
  nominations => _.filter(nominations, { isSelf: false }),
)


export const getUserEvaluations = createSelector(
  getCurrentUser,
  ({ campaigns }) => getEvaluations(campaigns),
  (user, evaluations) => _.filter(evaluations, { evaluatorId: user && user.id }),
)

export const getSubjectReport = createSelector(
  getReports,
  reports => _.find(reports, { isSelf: true }),
)

export const getApprovalReports = createSelector(
  getReports,
  reports => _.filter(reports, { isSelf: false }),
)
