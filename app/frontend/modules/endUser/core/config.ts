import _ from 'lodash'
import { RootState } from '~/modules/endUser/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])
export const getMaintenanceDate = (state: RootState) => _.get(state, ['config', 'maintenance', 'startDate'])
export const getlighthousePrivacyUrl = (state: RootState) => _.get(state, ['config', 'lighthousePrivacyUrl'])
export const getprivacyPolicyVersion = (state: RootState) => _.get(state, ['config', 'privacyPolicyVersion'])
export const getCustomPrivacyConsentText = (state: RootState) => _.get(state, ['config', 'customPrivacyConsentText'])
export const getShowBookings = (state: RootState) => _.get(state, ['config', 'showBookings'])

export const defaultState = {
  agileAssetsUrl: '',
  maintenance: {
    startDate: null,
  },
  profile: {
    fields: [],
    requiredFields: {},
    lockedFields: {},
    enabledFields: {},
  },
}

export default function reducer (state = defaultState) {
  return state
}
