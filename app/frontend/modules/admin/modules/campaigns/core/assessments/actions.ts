import * as t from 'io-ts'

export const ACTIVATE_UNIVERSAL_LINK = 'campaigns/ACTIVATE_UNIVERSAL_LINK'
export const DEACTIVATE_UNIVERSAL_LINK = 'campaigns/DEACTIVATE_UNIVERSAL_LINK'
export const REGENERATE_UNIVERSAL_LINK = 'campaigns/REGENERATE_UNIVERSAL_LINK'
export const IMPORT_RAW_RESULTS = 'campaigns/assessments/IMPORT_RAW_RESULTS'
export const IMPORT_SCORING_RESULTS = 'campaigns/assessments/IMPORT_SCORING_RESULTS'
export const FETCH_NORMS = 'campaigns/assessments/FETCH_NORMS'
export const UPDATE_NORM = 'campaigns/assessments/UPDATE_NORM'
export const UPDATE_ASSESSOR_FORM = 'campaigns/assessments/UPDATE_ASSESSOR_FORM'
export const RESCORE_RESPONSES = 'campaigns/assessments/RESCORE_RESPONSES'
export const REMOVE = 'campaigns/assessments/REMOVE'
export const UPDATE_AVAILABLE_LOCALES = 'campaigns/userAssessments/UPDATE_AVAILABLE_LOCALES'

const EXPORT_RAW_RESULTS = 'campaigns/userAssessments/EXPORT_RAW_RESULT'
const EXPORT_SCORING_RESULTS = 'campaigns/userAssessments/EXPORT_SCORING_RESULTS'
const EXPORT_NORMED_RESULTS = 'campaigns/userAssessments/EXPORT_NORMED_RESULTS'
const EXPORT_RAW_FACTOR_SCORES = 'campaigns/userAssessments/EXPORT_RAW_FACTOR_RESULTS'
const EXPORT_EXTERNAL_RESULTS = 'campaigns/userAssessments/EXPORT_EXTERNAL_RESULTS'

export const UPDATE_PREWORK = 'campaigns/assessments/UPDATE_PREWORK'
export const updatePrework = (campaignId: number, id: number, prework: boolean) => ({
  type: UPDATE_PREWORK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/update_prework`,
    body: { prework },
  },
})

export const UPDATE_WORKSHOP_ACTIVITY = 'campaigns/assessments/UPDATE_WORKSHOP_ACTIVITY'
export const updateWorkshopActivity = (campaignId: number, id: number, body) => ({
  type: UPDATE_WORKSHOP_ACTIVITY,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/update_workshop_activity`,
    body,
  },
})

export const activateUniversalLink = (campaignId: string, id: number) => ({
  type: ACTIVATE_UNIVERSAL_LINK,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}/activate`,
  },
  campaignId,
})

export const deactivateUniversalLink = (campaignId: string, id: number) => ({
  type: DEACTIVATE_UNIVERSAL_LINK,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}`,
  },
})

export const regenerateUniversalLink = (campaignId: string, id: number) => ({
  type: REGENERATE_UNIVERSAL_LINK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}`,
  },
  campaignId,
})

interface Body {
  file: File
}

export const importRawResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_RAW_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_results`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const rescoreResponses = (campaignId: number, assessmentId: number) => ({
  type: RESCORE_RESPONSES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/rescore_responses`,
  },
})

export const remove = (campaignId: number, assessmentId: number,
  options: { removeUserAssessments: boolean }) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}`,
    body: {
      remove_user_assessments: options.removeUserAssessments,
    },
  },
})

export const importScoringResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_SCORING_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_results?scoring=true`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const updateNorm = (campaignId: number, assessmentId: number, body) => ({
  type: UPDATE_NORM,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_norm`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

const UpdateAssessorFormTR = t.type({
  assessorFormName: t.union([t.string, t.null]),
  assessorFormId: t.union([t.number, t.null]),
})

export const updateAssessorForm = (campaignId: number, assessmentId: number, body) => ({
  type: UPDATE_ASSESSOR_FORM,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_assessor_form`,
    body: { ...body, id: assessmentId },
    loader: true,
    typedResponse: UpdateAssessorFormTR,
  },
})

export const updateAvailableLocales = (
  campaignId: number, assessmentId: number, body: { availableLocales: string[] },
) => ({
  type: UPDATE_AVAILABLE_LOCALES,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_available_locales`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const exportRawResults = (campaignId: number, assessmentId: number, withLabels: boolean) => ({
  type: EXPORT_RAW_RESULTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_raw_results`,
    body: { withLabels },
    loader: true,
  },
})

export const exportScoringResults = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_SCORING_RESULTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_scoring_results`,
    loader: true,
  },
})

export const exportNormedResults = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_NORMED_RESULTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_normed_results`,
    loader: true,
  },
})

export const exportRawFactorScores = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_RAW_FACTOR_SCORES,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_raw_factor_scores`,
    loader: true,
  },
})

export const exportExternalResults = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_EXTERNAL_RESULTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_external_results`,
    loader: true,
  },
})

export const UPDATE_EXTERNAL_CONFIG = 'campaigns/assessments/UPDATE_EXTERNAL_CONFIG'
export const updateExternalConfig = (campaignId: number, campaignAssessmentId: number, body: object) => ({
  type: UPDATE_EXTERNAL_CONFIG,
  request: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: `/administration/new_campaigns/${campaignId}/campaign_assessments/${campaignAssessmentId}/update_external_config`,
    body,
    loader: true,
  },
})
