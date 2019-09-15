import { createSelector } from 'reselect'
import { getUserId } from 'admin/core/temp/modals'
import { setIn } from 'utils/immutable'
import _ from 'lodash'

export const FETCH_ALL_BY_USER_ID = 'threeSixty/participants/FETCH_ALL_BY_USER_ID'
export const UPDATE = 'threeSixty/participants/UPDATE'
export const DESTROY = 'threeSixty/participants/DESTROY'
export const DESTROY_EVALUATION = 'threeSixty/participants/DESTROY_EVALUATION'

export const defaultState = []

export const fetchAllByUserId = (campaignId, userId) => ({
  type: FETCH_ALL_BY_USER_ID,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/participants`,
    body: { userId },
  },
})

export const update = (campaignId, participantId, attrs) => ({
  type: UPDATE,
  campaignId,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/participants/${participantId}`,
    body: attrs,
  },
})

export const remove = (campaignId, participantId) => ({
  type: DESTROY,
  campaignId,
  id: participantId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/participants/${participantId}`,
  },
})

export const removeEvaluation = (campaignId, participantId, subjectId, evaluationId) => ({
  type: DESTROY_EVALUATION,
  participantId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/evaluations/${evaluationId}`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_BY_USER_ID:
      return action.response
    case UPDATE:
      return state.map(p => (p.id === action.response.id ? { ...p, ...action.response } : p))
    case DESTROY:
      return state.filter(p => (p.id !== action.requestAction.id))
    case DESTROY_EVALUATION:
      // eslint-disable-next-line no-case-declarations
      const index = _.findIndex(state, { id: action.requestAction.participantId })
      return setIn(state, [index, 'result'], null)
    default:
      return state
  }
}

const getParticipants = state => state.threeSixtyCampaign.participants

export const getUserEvaluators = createSelector(
  getParticipants,
  getUserId,
  (participants, userId) => participants.filter(p => p.subject.id === userId).map(p => ({ ...p, user: p.evaluator })),
)

export const getUserSubjects = createSelector(
  getParticipants,
  getUserId,
  (participants, userId) => participants.filter(p => p.evaluator.id === userId).map(p => ({ ...p, user: p.subject })),
)

export const getResults = createSelector(
  getParticipants,
  participants => participants.filter(p => p.result).map(p => ({ ...p, user: p.subject })),
)
