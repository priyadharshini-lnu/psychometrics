import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'

interface FeaturesFlags {
  [name: string]: boolean
}

interface ConfigState {
  availableLocales: string[]
  features: FeaturesFlags
}

export const defaultState: ConfigState = {
  availableLocales: [],
  features: {},
}

export const getFeatures = (state): FeaturesFlags => _.get(state, ['config', 'features'], {})
export const isProjectMigrated = (state: RootState): boolean => _.get(state, ['config', 'isProjectMigrated'])
export const availableLocales = (state: RootState): string[] => _.get(state, ['config', 'availableLocales'], [])

const HANDLERS = {}

export default createReducer(HANDLERS, defaultState)
