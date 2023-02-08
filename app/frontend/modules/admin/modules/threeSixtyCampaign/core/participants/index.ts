import { createSelector } from 'reselect'
import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { getUserId } from '~/modules/admin/core/ui/modals'
import { setIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

export const FETCH_ALL_BY_USER_ID = 'threeSixty/participants/FETCH_ALL_BY_USER_ID'
export const UPDATE = 'threeSixty/participants/UPDATE'
export const DESTROY = 'threeSixty/participants/DESTROY'
export const DESTROY_EVALUATION = 'threeSixty/participants/DESTROY_EVALUATION'

export const defaultState = []

interface UpdateAttrs {
  relationship_id: number
  manager_nomination_status: string
  evaluator_nomination_status: string
  manager_evaluation_status: string
}

export const fetchAllByUserId = (campaignId: number, userId: number) => ({
  type: FETCH_ALL_BY_USER_ID,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/participants`,
    body: { userId },
  },
})

export const update = (campaignId: number, participantId: number, attrs: UpdateAttrs) => ({
  type: UPDATE,
  campaignId,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/participants/${participantId}`,
    body: attrs,
  },
})

export const remove = (campaignId: number, participantId: number) => ({
  type: DESTROY,
  campaignId,
  id: participantId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/participants/${participantId}`,
  },
})

export const removeEvaluation = (
  campaignId: number, participantId: number, subjectId: number, evaluationId: number,
) => ({
  type: DESTROY_EVALUATION,
  participantId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/evaluations/${evaluationId}`,
  },
})

interface Participant {
  id: number
}
type State = Participant[]

export type FetchAllAction = ApiActionResponse<Participant[]>
export type UpdateAction = ApiActionResponse<Participant>
export type DestroyAction = ApiActionResponse<Participant[]>
export type DestroyEvaluationAction = ApiActionResponse<Participant[]>

const HANDLERS = {
  [FETCH_ALL_BY_USER_ID]: (_: State, { response }: FetchAllAction) => (response),
  [UPDATE]: (state: State, { response }: UpdateAction) => state.map(
    p => (p.id === response.id ? { ...p, ...response } : p),
  ),
  [DESTROY]: (state: State, { requestAction }: DestroyAction) => state.filter(p => (p.id !== requestAction.id)),
  [DESTROY_EVALUATION]: (state: State, { requestAction }: DestroyEvaluationAction) => {
    const index = _.findIndex(state, { id: requestAction.participantId })
    return setIn(state, [index, 'result'], null)
  },
}

export default createReducer(HANDLERS, defaultState)

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
