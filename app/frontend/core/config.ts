import _ from 'lodash'

import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import { createReducer } from '~/utils/redux'

interface FeaturesFlags {
  [name: string]: boolean
}

export interface AiModel {
  model_id: string
  description?: string
  name: string
  region?: string
  model: string
  provider?: string
  supports_reasoning?: boolean
  supports_temperature?: boolean
  supports_thinking_budget?: boolean
}

export interface ConfigState {
  availableLocales: string[]
  features: FeaturesFlags,
  project: {
    idpEnabled: boolean
    enhanceWithAiEnabled: boolean
    aiAssistedIdpFeatureEnabled: boolean,
  },
  timezone: string,
  availableAiProviders: AiModel[]
}

export const defaultState: ConfigState = {
  availableLocales: [],
  features: {},
  timezone: '',
  project: {
    idpEnabled: false,
    enhanceWithAiEnabled: false,
    aiAssistedIdpFeatureEnabled: false,
  },
  availableAiProviders: [],
}

type FetchType = ApiActionResponse<{
  config: ConfigState
}>

export const getFeatures = (state): FeaturesFlags => _.get(state, ['config', 'features'], {})
export const getProjectFeatures = (state): FeaturesFlags => _.get(state, ['config', 'project'], {})
export const getTimezone = (state): string => _.get(state, ['config', 'timezone'])
export const availableLocales = (state: RootState): string[] => _.get(state, ['config', 'availableLocales'], [])
export const getAvailableAiProviders = (state: RootState): AiModel[] => _.get(state,
  ['config', 'availableAiProviders'], [])

const HANDLERS = {
  [FETCH_PROJECT]: (state: ConfigState, action: FetchType) => ({
    ...state,
    ...action.response.config,
  }),
}

export default createReducer(HANDLERS, defaultState)
