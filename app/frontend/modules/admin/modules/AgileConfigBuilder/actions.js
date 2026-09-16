import { createSlice } from '@reduxjs/toolkit'

export const SAVE_AGILE_CONFIG = 'SAVE_AGILE_CONFIG'
export const FETCH_AGILE_CONFIG = 'FETCH_AGILE_CONFIG'

export const saveConfig = (assessmentId, data) => ({
  type: SAVE_AGILE_CONFIG,
  request: {
    url: `/administration/assessments/${assessmentId}/agiles`,
    method: 'put',
    decamelize: false,
    body: { agile: data },
  },
})

// camelize: false - config/translations are opaque JSON blobs edited verbatim in the JSON editor;
// the api middleware's default recursive camelizeKeys would rewrite their nested keys on every load.
export const fetchAgileConfig = assessmentId => ({
  type: FETCH_AGILE_CONFIG,
  request: {
    url: `/administration/assessments/${assessmentId}/agiles`,
    method: 'get',
    camelize: false,
  },
})

const settings = createSlice({
  name: 'settings',
  initialState: {
    extra: {},
  },
  reducers: {
    updateSettings (state, { payload }) {
      state.extra = payload
    },
  },
})

export const { updateSettings } = settings.actions

export default settings.reducer
