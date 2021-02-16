import _ from 'lodash'
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

const HANDLERS = {}

export default createReducer(HANDLERS, defaultState)
