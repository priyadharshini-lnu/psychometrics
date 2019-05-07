import { createSelector } from 'reselect'

export const FETCH_ALL_BY_USER_ID = 'threeSixty/participants/FETCH_ALL_BY_USER_ID'

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


export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_BY_USER_ID:
      return action.response
    default:
      return state
  }
}

const participantsSelector = state => state.threeSixtyCampaign.participants
const userIdSelector = state => state.temp.modals.data.id

export const getUserEvaluators = createSelector(
  participantsSelector,
  userIdSelector,
  (participants, userId) => (participants.filter(p => p.subject.id === userId)),
)

export const getUserSubjects = createSelector(
  participantsSelector,
  userIdSelector,
  (participants, userId) => (participants.filter(p => p.evaluator.id === userId)),
)
