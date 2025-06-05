import _ from 'lodash'

import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'
import { createReducer } from '~/utils/redux'

interface FeaturesFlags {
  [name: string]: boolean
}

export interface ConfigState {
  availableLocales: string[]
  features: FeaturesFlags,
  timezone: string,
  availableAiProviders: string[]
}

export const defaultState: ConfigState = {
  availableLocales: [],
  features: {},
  timezone: '',
  availableAiProviders: [],
}

type FetchType = ApiActionResponse<{
  config: ConfigState
}>

export const getFeatures = (state): FeaturesFlags => _.get(state, ['config', 'features'], {})
export const getTimezone = (state): string => _.get(state, ['config', 'timezone'])
export const availableLocales = (state: RootState): string[] => _.get(state, ['config', 'availableLocales'], [])
export const getAvailableAiProviders = (state: RootState): string[] => _.get(state,
  ['config', 'availableAiProviders'], [])

const HANDLERS = {
  [FETCH_PROJECT]: (state: ConfigState, { response }: FetchType) => ({
    ...state,
    ...response.config,
  }),
}

export default createReducer(HANDLERS, defaultState)
