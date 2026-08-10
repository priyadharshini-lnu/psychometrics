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
// Per-project flag: render the glint end-user pages instead of the legacy tree.
export const getGlintUi = (state: RootState): boolean => _.get(state, ['config', 'glintUi'], false)

export const getIdpSettings = (state: RootState) => _.get(state, ['config', 'idp'])
export const getSecuritySettings = (state: RootState) => _.get(state, ['config', 'securitySettings'])

/** A configurable profile question, as the server injects it into the config slice. */
export type ProfileField = {
  id: number
  name: string
  question_id: number
  required?: boolean
  half_size?: boolean
  locked: boolean
  question: {
    id: number
    type: string
    props: { type: string; choices: number; choicesTexts: string[]; questionText?: string }
  }
  translations: { questionText?: string }
}

export type ProfileConfig = {
  fields: ProfileField[]
  requiredFields: Record<string, boolean>
  lockedFields: Record<string, boolean>
  enabledFields: Record<string, boolean>
}

const defaultProfile: ProfileConfig = {
  fields: [],
  requiredFields: {},
  lockedFields: {},
  enabledFields: {},
}

export const defaultState = {
  agileAssetsUrl: '',
  profile: defaultProfile,
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
