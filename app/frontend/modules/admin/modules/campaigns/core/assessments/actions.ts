import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'

export const ENABLE_UNIVERSAL_LINK = 'campaigns/ENABLE_UNIVERSAL_LINK'
export const SAVE_UNIVERSAL_LINK = 'campaigns/SAVE_UNIVERSAL_LINK'
export const REGENERATE_UNIVERSAL_LINK = 'campaigns/REGENERATE_UNIVERSAL_LINK'

export const IMPORT_RAW_RESULTS = 'campaigns/assessments/IMPORT_RAW_RESULTS'
export const IMPORT_SCORING_RESULTS = 'campaigns/assessments/IMPORT_SCORING_RESULTS'
export const IMPORT_EXTERNAL_SCORING_RESULTS = 'campaigns/assessments/IMPORT_EXTERNAL_SCORING_RESULTS'
export const FETCH_NORMS = 'campaigns/assessments/FETCH_NORMS'
export const UPDATE_NORM = 'campaigns/assessments/UPDATE_NORM'
export const UPDATE_ASSESSOR_FORM = 'campaigns/assessments/UPDATE_ASSESSOR_FORM'
export const RESCORE_RESPONSES = 'campaigns/assessments/RESCORE_RESPONSES'
export const REGENERATE_TRANSCRIPTIONS = 'campaigns/assessments/REGENERATE_TRANSCRIPTIONS'
export const REMOVE = 'campaigns/assessments/REMOVE'
export const UPDATE_AVAILABLE_LOCALES = 'campaigns/userAssessments/UPDATE_AVAILABLE_LOCALES'

const EXPORT_RAW_RESULTS = 'campaigns/userAssessments/EXPORT_RAW_RESULT'
const EXPORT_SCORING_RESULTS = 'campaigns/userAssessments/EXPORT_SCORING_RESULTS'
const EXPORT_NORMED_RESULTS = 'campaigns/userAssessments/EXPORT_NORMED_RESULTS'
const EXPORT_RAW_FACTOR_SCORES = 'campaigns/userAssessments/EXPORT_RAW_FACTOR_RESULTS'
const EXPORT_EXTERNAL_RESULTS = 'campaigns/userAssessments/EXPORT_EXTERNAL_RESULTS'
const EXPORT_OCCUPATIONS = 'campaigns/assessments/EXPORT_OCCUPATIONS'

export const BULK_EXPORT_RAW_FACTOR_SCORES = 'campaigns/assessments/BULK_EXPORT_RAW_FACTOR_SCORES'
export const BULK_EXPORT_NORM_FACTOR_SCORES = 'campaigns/assessments/BULK_EXPORT_NORM_FACTOR_SCORES'
export const TOGGLE_REQUIRE_SCHEDULE = 'campaigns/assessments/TOGGLE_REQUIRE_SCHEDULE'
export const TOGGLE_AUTO_ASSIGN = 'campaigns/assessments/TOGGLE_AUTO_ASSIGN'

export const UPDATE_METTL_SCHEDULE = 'campaigns/assessments/UPDATE_METTL_SCHEDULE'
export const NORMALIZE_FACTOR_SCORES = 'campaigns/assessments/NORMALIZE_FACTOR_SCORES'
export const UPDATE_CONTENT_VARIATION = 'campaigns/assessments/UPDATE_CONTENT_VARIATION'

export const UPDATE_PREWORK = 'campaigns/assessments/UPDATE_PREWORK'
export const TOGGLE_ASSESSMENT_CACHING = 'campaigns/assessments/TOGGLE_ASSESSMENT_CACHING'

export const UPDATE_MHS_LEADERSHIP_BAR = 'campaigns/assessments/UPDATE_MHS_LEADERSHIP_BAR'
export const UPDATE_MHS_CONFIDENCE_INTERVAL = 'campaigns/assessments/UPDATE_MHS_CONFIDENCE_INTERVAL'
export const UPDATE_MHS_NORM_REGION = 'campaigns/assessments/UPDATE_MHS_NORM_REGION'
export const UPDATE_MHS_NORM_OPTION = 'campaigns/assessments/UPDATE_MHS_NORM_OPTION'

export const updatePrework = (campaignId: number, id: number, body: object) => ({
  type: UPDATE_PREWORK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/update_prework`,
    body,
  },
})

export const toggleRequireScheduling = (campaignId: number, id: number, requireScheduling: boolean) => ({
  type: TOGGLE_REQUIRE_SCHEDULE,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/toggle_require_scheduling`,
    body: {
      requireScheduling,
    },
  },
})

export const toggleAutoAssign = (campaignId: number, id: number, autoAssign: boolean) => ({
  type: TOGGLE_AUTO_ASSIGN,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/toggle_auto_assign`,
    body: { autoAssign },
  },
})

export const SCHEDULE_ASSESSMENT = 'campaigns/assessments/SCHEDULE_ASSESSMENT'
export const scheduleAssessment = (campaignId: number, id: number,
  { scheduleTime, overrideExisting = false, requireScheduling }) => ({
  type: SCHEDULE_ASSESSMENT,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/schedule_assessment`,
    loader: true,
    body: { scheduleTime, overrideExisting, requireScheduling },
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


export const enableUniversalLink = (campaignId: string, id: number):
  ApiAction<{ universalLink: string, enableUniversalLinks: boolean }> => ({
  type: ENABLE_UNIVERSAL_LINK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}/enable`,
  },
  campaignId,
})


export const saveUniversalLink = (campaignId: string, id: number, data) => ({
  type: SAVE_UNIVERSAL_LINK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}`,
    body: data,
  },
  campaignId,
})


export const regenerateUniversalLink = (campaignId: string, id: number) => ({
  type: REGENERATE_UNIVERSAL_LINK,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/universal_links/${id}/regenerate`,
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

export const rescoreResponses = (campaignId: number, assessmentId: number, allowAiRescore: boolean = false) => ({
  type: RESCORE_RESPONSES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/rescore_responses`,
    body: { allow_ai_rescore: allowAiRescore },
  },
})

export const regenerateTranscriptions = (campaignId: number, assessmentId: number) => ({
  type: REGENERATE_TRANSCRIPTIONS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/regenerate_transcriptions`,
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

export const importExternalScoringResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_EXTERNAL_SCORING_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_external_scoring_results`,
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

export const updateMettlSchedule = (campaignId: number, assessmentId: number, body) => ({
  type: UPDATE_METTL_SCHEDULE,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_mettl_schedule`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updateContentVariation = (campaignId: string, assessmentId: number, body) => ({
  type: UPDATE_CONTENT_VARIATION,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_content_variation`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updatePearsonVariation = (campaignId: string, assessmentId: number, body) => ({
  type: 'campaigns/assessments/UPDATE_PEARSON_VARIATION',
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_pearson_variation`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updateMhsConfidenceInterval = (campaignId: string, assessmentId: number, body) => ({
  type: UPDATE_MHS_CONFIDENCE_INTERVAL,
  assessmentId,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_mhs_confidence_interval`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updateMhsLeadershipBar = (campaignId: string, assessmentId: number, body) => ({
  type: UPDATE_MHS_LEADERSHIP_BAR,
  assessmentId,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_mhs_leadership_bar`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updateMhsNormRegion = (campaignId: string, assessmentId: number, body) => ({
  type: UPDATE_MHS_NORM_REGION,
  assessmentId,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_mhs_norm_region`,
    body: { ...body, id: assessmentId },
    loader: true,
  },
})

export const updateMhsNormOption = (campaignId: string, assessmentId: number, body) => ({
  type: UPDATE_MHS_NORM_OPTION,
  assessmentId,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_mhs_norm_option`,
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

export const exportRawResults = (campaignId: number, assessmentId: number, body: object = {}) => ({
  type: EXPORT_RAW_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_raw_results`,
    body,
    loader: true,
  },
})

export const exportScoringResults = (campaignId: number, assessmentId: number, body: object = {}) => ({
  type: EXPORT_SCORING_RESULTS,
  request: {
    method: 'post',
    body,
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_scoring_results`,
    loader: true,
  },
})

export const exportNormedResults = (campaignId: number, assessmentId: number, body: object = {}) => ({
  type: EXPORT_NORMED_RESULTS,
  request: {
    method: 'post',
    body,
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_normed_results`,
    loader: true,
  },
})

export const exportRawFactorScores = (campaignId: number, assessmentId: number, body: object = {}) => ({
  type: EXPORT_RAW_FACTOR_SCORES,
  request: {
    method: 'post',
    body,
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_raw_factor_scores`,
    loader: true,
  },
})

export const exportExternalResults = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_EXTERNAL_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_external_results`,
    loader: true,
  },
})

export const exportOccupations = (campaignId: number, assessmentId: number) => ({
  type: EXPORT_OCCUPATIONS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/export_occupations`,
    loader: true,
  },
})

export const bulkExportRawFactorScores = (
  campaignId: number,
  body: {
    assessmentIds: number[]
    startDate: Date
    endDate: Date
    includeInactiveUsers?: boolean
  },
) => ({
  type: BULK_EXPORT_RAW_FACTOR_SCORES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/bulk_export_raw_factor_scores`,
    body,
    loader: true,
  },
})

export const bulkExportNormFactorScores = (
  campaignId: number,
  body: {
    assessmentIds: number[]
    startDate: Date
    endDate: Date
    includeInactiveUsers?: boolean
  },
) => ({
  type: BULK_EXPORT_NORM_FACTOR_SCORES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/bulk_export_norm_factor_scores`,
    body,
    loader: true,
  },
})

export const normalizeFactorScores = (campaignId: number, assessmentId: number) => ({
  type: NORMALIZE_FACTOR_SCORES,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/normalize_factor_scores`,
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

export const toggleAssessmentCaching = (campaignId: number, id: number, cachingEnabled: boolean) => ({
  type: TOGGLE_ASSESSMENT_CACHING,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/toggle_caching`,
    body: { cachingEnabled },
  },
})

export const UPDATE_PROCTORING_SETTINGS = 'campaigns/assessments/UPDATE_PROCTORING_SETTINGS'
export const updateProctoringSettings = (
  campaignId: number, id: number, body: { proctoringEnabled: boolean },
) => ({
  type: UPDATE_PROCTORING_SETTINGS,
  request: {
    method: 'put',
    url: `/administration/new_campaigns/${campaignId}/assessments/${id}/update_proctoring_settings`,
    body,
    loader: true,
  },
})
