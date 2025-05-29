import _ from 'lodash'
import { RootState } from '~/modules/endUser/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])
export const getMaintenanceDate = (state: RootState) => _.get(state, ['config', 'maintenance', 'startDate'])
export const getlighthousePrivacyUrl = (state: RootState) => _.get(state, ['config', 'lighthousePrivacyUrl'])
export const getprivacyPolicyVersion = (state: RootState) => _.get(state, ['config', 'privacyPolicyVersion'])
export const getCustomPrivacyConsentText = (state: RootState) => _.get(state, ['config', 'customPrivacyConsentText'])
export const getShowBookings = (state: RootState) => _.get(state, ['config', 'showBookings'])
export const getIdpSettings = (state: RootState) => _.get(state, ['config', 'idp'])

export const defaultState = {
  agileAssetsUrl: '',
  maintenance: {
    startDate: null,
    remainingTime: null,
  },
  profile: {
    fields: [],
    requiredFields: {},
    lockedFields: {},
    enabledFields: {},
  },
  idp: {
    allowGlobalSkills: false,
    managerApprovesIdp: false,
    managerCanEditIdp: false,
    requireAllDevelopmentActionsComplete: false,
  },
  design: {
    primary_color: null,
    error_color: null,
    warning_color: null,
    success_color: null,
    info_color: null,
  },
}

export default function reducer (state = defaultState) {
  return state
}
