export const ACTIVATE_UNIVERSAL_LINK = 'campaigns/ACTIVATE_UNIVERSAL_LINK'
export const DEACTIVATE_UNIVERSAL_LINK = 'campaigns/DEACTIVATE_UNIVERSAL_LINK'
export const REGENERATE_UNIVERSAL_LINK = 'campaigns/REGENERATE_UNIVERSAL_LINK'
export const IMPORT_RAW_RESULTS = 'campaigns/assessments/IMPORT_RAW_RESULTS'
export const IMPORT_SCORING_RESULTS = 'campaigns/assessments/IMPORT_SCORING_RESULTS'
export const FETCH_NORMS = 'campaigns/assessments/FETCH_NORMS'
export const UPDATE_NORM = 'campaigns/assessments/UPDATE_NORM'

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
  },
})

export const importScoringResults = (campaignId: number, assessmentId: number, body: Body) => ({
  type: IMPORT_SCORING_RESULTS,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/import_results?scoring=true`,
    body,
    loader: true,
  },
})

export const fetchNorms = (campaignId: number, assessmentId: number) => ({
  type: FETCH_NORMS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/norms`,
    body: {
      id: assessmentId,
    },
  },
})


export const updateNorm = (campaignId: number, assessmentId: number, body) => ({
  type: UPDATE_NORM,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/assessments/${assessmentId}/update_norm`,
    body: { ...body, id: assessmentId },
  },
})
