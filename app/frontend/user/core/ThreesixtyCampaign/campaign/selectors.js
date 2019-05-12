import _ from 'lodash'
import { createSelector } from 'reselect'

export const getNominations = state => state.campaign.nominations
export const getEvaluations = state => state.campaign.evaluations

export const getApprovalNominations = createSelector(
  getNominations,
  nominations => _.filter(nominations, { isSelf: false }),
)

export const getApprovalEvaluations = createSelector(
  getEvaluations,
  evaluations => _.filter(evaluations, { isSelf: false }),
)
