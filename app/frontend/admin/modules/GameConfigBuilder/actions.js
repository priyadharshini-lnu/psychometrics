export const SAVE_GAME_CONFIG = 'SAVE_GAME_CONFIG'

export const saveConfig = (assessmentId, data) => ({
  type: SAVE_GAME_CONFIG,
  request: {
    url: `/administration/assessments/${assessmentId}/games`,
    method: 'put',
    decamelize: false,
    body: { game: data },
  },
})
