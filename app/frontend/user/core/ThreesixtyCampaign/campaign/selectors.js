import _ from 'lodash'
import { createSelector } from 'reselect'

export const getCurrentUser = state => state.temp.currentUser
export const getNominations = state => state.campaign.nominations
export const getEvaluations = state => state.campaign.evaluations
export const getReports = state => state.campaign.reports

export const getApprovalNominations = createSelector(
  getNominations,
  nominations => _.filter(nominations, { isSelf: false }),
)


export const getUserEvaluations = createSelector(
  getCurrentUser,
  getEvaluations,
  (user, evaluations) => _.filter(evaluations, { evaluatorId: user && user.id }),
)

export const getApprovalEvaluations = createSelector(
  getEvaluations,
  evaluations => _.filter(evaluations, { asManager: true }),
)

export const getSubjectReport = createSelector(
  getReports,
  reports => _.find(reports, { isSelf: true }),
)

export const getApprovalReports = createSelector(
  getReports,
  reports => _.filter(reports, { isSelf: false }),
)
