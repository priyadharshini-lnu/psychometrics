import _ from 'lodash'
import { RootState } from '~/modules/endUser/core/rootReducers'

export const get = (state: RootState) => _.get(state, ['config'])
export const getlighthousePrivacyUrl = (state: RootState) => _.get(state, ['config', 'lighthousePrivacyUrl'])
export const getprivacyPolicyVersion = (state: RootState) => _.get(state, ['config', 'privacyPolicyVersion'])
export const getCustomPrivacyConsentText = (state: RootState) => _.get(state, ['config', 'customPrivacyConsentText'])
export const getCustomPrivacyAcknowledgmentText = (state: RootState) => _.get(state,
  ['config', 'customPrivacyAcknowledgmentText'])
export const getShowBookings = (state: RootState) => _.get(state, ['config', 'showBookings'])
export const getShowMaintenanceAlert = (state: RootState): boolean => (
  _.get(state, ['config', 'showMaintenanceAlert'], false)
)
export const getIdpSettings = (state: RootState) => _.get(state, ['config', 'idp'])
export const getSecuritySettings = (state: RootState) => _.get(state, ['config', 'securitySettings'])

export const defaultState = {
  agileAssetsUrl: '',
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
    aiAssistants: false,
    aiAssistedIdpFeatureEnabled: false,
    idpEnabled: false,
    userHasActiveIdp: false,
    userHasDirectReporteesWithActiveIdp: false,
    aiAssistedIdpHasDocumentAnalysis: false,
  },
  design: {
    primary_color: null,
    error_color: null,
    warning_color: null,
    success_color: null,
    info_color: null,
  },
  securitySettings: {
    enableRecaptcha: false,
  },
  showMaintenanceAlert: false,
}

export default function reducer (state = defaultState) {
  return state
}
