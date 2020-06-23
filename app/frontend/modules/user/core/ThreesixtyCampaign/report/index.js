import humps from 'humps'
import { setIn } from 'utils/immutable'

const FETCH_REPORTS = 'threeSixty/report/FETCH_REPORTS'
const UPDATE_STATUS = 'threeSixty/report/UPDATE_STATUS'
const DOWNLOAD_REPORT = 'threeSixty/report/DOWNLOAD_REPORT'

export const fetchReport = (campaignId, id) => ({
  type: FETCH_REPORTS,
  request: {
    url: `/campaigns/${campaignId}/reports/${id}`,
    camelize: false,
  },
})


export const updateStatus = (campaignId, id, status) => ({
  type: UPDATE_STATUS,
  request: {
    url: `/campaigns/${campaignId}/reports/${id}/update_status`,
    method: 'put',
    body: {
      status,
    },
  },
})

export const downloadReport = (campaignId, id, lang) => ({
  type: DOWNLOAD_REPORT,
  request: {
    url: `/campaigns/${campaignId}/reports/${id}/download`,
    body: { lang },
  },
})

export const defaultState = {
  loaded: false,
  user: {},
  options: { reports: { approval: {} } },
  report: {},
  results: {},
}

const HANDLERS = {
  [FETCH_REPORTS]: (state, action) => ({
    ...humps.camelizeKeys(action.response),
    results: action.response.results,
    report: action.response.report,
    loaded: true,
  }),
  [UPDATE_STATUS]: (state, action) => setIn(state, ['approvalStatus'], action.response.status),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
