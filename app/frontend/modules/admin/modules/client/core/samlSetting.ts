import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import { createReducer } from '~/utils/redux'
import { State as ProjectState } from './projects'

export const get = (state: RootState) => _.get(state, ['project', 'samlSetting'])

export interface State {
  id: number
  enabled: boolean
  enforced: boolean
  enforceFor: 'none' | 'all' | 'specific_domains'
  enforcedDomains: string[]
  entityId: string
  ssoServiceUrl: string
  cert: string
  afterSignoutUrl: string
  assertionConsumerServiceUrl: string
  issuer: string
  nameIdentifierFormat: string
  emailPipetext?: string
}

const defaultState = {} as State

export const UPDATE_SETTINGS = 'resource/campaigns/samlSetting/UPDATE'
export const PARSE_METADATA = 'resource/campaigns/samlSetting/PARSE_METADATA'

export const parseMetadata = (
  projectId: string, body: Record<string, unknown>,
): ApiAction<Record<string, unknown>> => ({
  type: PARSE_METADATA,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/saml_settings/parse_metadata`,
    body,
  },
})

type FetchType = ApiActionResponse<ProjectState>

const HANDLERS = {
  [FETCH_PROJECT]: (state: State, { response: { project: { samlSetting } } }: FetchType) => ({
    ...state,
    ...samlSetting,
  }),
}


export const reducer = createReducer(HANDLERS, defaultState)
