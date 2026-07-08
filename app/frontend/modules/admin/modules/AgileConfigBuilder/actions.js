import { createSlice } from '@reduxjs/toolkit'

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

const settings = createSlice({
  name: 'settings',
  initialState: {
    /* eslint no-underscore-dangle: 0 */
    extra: window.__PROPS__?.extra || {},
  },
  reducers: {
    updateSettings (state, { payload }) {
      state.extra = payload
    },
  },
})

export const { updateSettings } = settings.actions

export default settings.reducer
