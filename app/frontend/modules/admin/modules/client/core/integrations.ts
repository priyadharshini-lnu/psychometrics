import _ from 'lodash'
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'

export const get = (state: RootState) => _.get(state, ['project', 'integrations'])
export const integrationNames = ['iiht', 'hogan', 'mettl', 'skillvue', 'yoodli', 'microsite']

const Integration = t.type({
  id: t.number,
  name: t.string,
  active: t.boolean,
})

export type Integration = t.TypeOf<typeof Integration>
export type State = Integration[]
const defaultState = [] as State

export const FETCH = 'resource/campaigns/integrations/FETCH'
const FetchResponseTR = t.array(Integration)
export type FetchResponse = t.TypeOf<typeof FetchResponseTR>
export const fetch = (projectId: string): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/integrations`,
    typedResponse: FetchResponseTR,
  },
})

export const REMOVE = 'resource/campaigns/integrations/REMOVE'
const RemoveTR = t.number
type RemoveType = t.TypeOf<typeof RemoveTR>
export const remove = (projectId: string, id: string): ApiAction<RemoveType> => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/projects/${projectId}/integrations/${id}`,
    loader: true,
    typedResponse: RemoveTR,
  },
})

export const LOAD_SKILLVUE_ASSESSMENTS = 'resource/campaigns/integrations/LOAD_SKILLVUE_ASSESSMENTS'
export const loadSkillvueAssessments = (projectId: string): ApiAction<void> => ({
  type: LOAD_SKILLVUE_ASSESSMENTS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/integrations/load_skillvue_assessments`,
    loader: true,
  },
})

export const LOAD_METTL_ASSESSMENTS = 'resource/campaigns/integrations/LOAD_METTL_ASSESSMENTS'
export const loadMettlAssessments = (projectId: string): ApiAction<void> => ({
  type: LOAD_METTL_ASSESSMENTS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/integrations/load_mettl_assessments`,
    loader: true,
  },
})

export const LOAD_MICROSITE_ASSESSMENTS = 'resource/campaigns/integrations/LOAD_MICROSITE_ASSESSMENTS'
export const loadMicrositeAssessments = (projectId: string): ApiAction<void> => ({
  type: LOAD_MICROSITE_ASSESSMENTS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/integrations/load_microsite_assessments`,
    loader: true,
  },
})

const CREATE = 'resource/campaigns/integrations/CREATE'
const UPDATE = 'resource/campaigns/integrations/UPDATE'

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
  [CREATE]: (state: State, { response }: ApiActionResponse<Integration>) => (
    [...state, response]
  ),
  [UPDATE]: (state: State, { response }: ApiActionResponse<Integration>) => (
    state.map((integration) => {
      if (integration.id === response.id) {
        return response
      }
      return integration
    })
  ),
  [REMOVE]: (state: State, { response }: ApiActionResponse<RemoveType>) => (
    state.filter(integration => integration.id !== response)
  ),
}
export const reducer = createReducer(HANDLERS, defaultState)
