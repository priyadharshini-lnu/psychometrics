import { createSelector } from 'reselect'

export const FETCH_ALL_BY_USER_ID = 'threeSixty/participants/FETCH_ALL_BY_USER_ID'
export const UPDATE = 'threeSixty/participants/UPDATE'
export const DESTROY = 'threeSixty/participants/DESTROY'

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

export const destroy = (campaignId, participantId) => ({
  type: DESTROY,
  campaignId,
  id: participantId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/participants/${participantId}`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_BY_USER_ID:
      return action.response
    case UPDATE:
      return state.map(p => (p.id === action.response.id ? action.response : p))
    case DESTROY:
      return state.filter(p => (p.id !== action.requestAction.id))
    default:
      return state
  }
}

const participantsSelector = state => state.threeSixtyCampaign.participants
const userIdSelector = state => state.temp.modals.data.user.id

export const getUserEvaluators = createSelector(
  participantsSelector,
  userIdSelector,
  (participants, userId) => participants.filter(p => p.subject.id === userId).map(p => ({ ...p, user: p.evaluator })),
)

export const getUserSubjects = createSelector(
  participantsSelector,
  userIdSelector,
  (participants, userId) => participants.filter(p => p.evaluator.id === userId).map(p => ({ ...p, user: p.subject })),
)
