export const SAVE_AGILE_CONFIG = 'SAVE_AGILE_CONFIG'

export const saveConfig = (assessmentId, data) => ({
  type: SAVE_AGILE_CONFIG,
  request: {
    url: `/administration/assessments/${assessmentId}/agiles`,
    method: 'put',
    decamelize: false,
    body: { agile: data },
  },
})
