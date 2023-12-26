import _ from 'lodash'
import { createSelector } from 'reselect'
import { get as getCurrentUser } from '~/core/currentUser'

export const get = state => _.get(state, ['campaigns', 'campaign'])
export const getUserAssessmentData = state => _.get(state, ['campaigns', 'userAssessment', 'userAssessmentData'])

export const getNominations = (state) => {
  const { nominations } = state.campaign
  const [selfNomination, otherNominations] = _.partition(nominations, { isSelf: true })
  return [...selfNomination, ..._.sortBy(otherNominations, nomination => nomination.user.firstName)]
}
export const getEvaluations = (state) => {
  const { evaluations } = state.campaign
  const [selfEvaluation, otherEvaluations] = _.partition(evaluations, { isSelf: true })
  return [...selfEvaluation, ..._.sortBy(otherEvaluations, evaluation => evaluation.subject.firstName)]
}
export const getManagedSubjects = (state) => {
  const manageSubjects = state.campaign.managedSubjects
  const [selfManageSubject, otherManageSubjects] = _.partition(manageSubjects, { isSelf: true })
  return [...selfManageSubject, ..._.sortBy(otherManageSubjects, manageSubject => manageSubject.user.firstName)]
}
export const getReports = (state) => {
  const { reports } = state.campaign
  const [selfReport, otherReports] = _.partition(reports, { isSelf: true })
  return [...selfReport, ..._.sortBy(otherReports, otherReport => otherReport.user.firstName)]
}

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
