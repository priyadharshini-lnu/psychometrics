import humps from 'humps'
import { setIn } from '~/utils/immutable'

const FETCH_REPORTS = 'threeSixty/report/FETCH_REPORTS'
const UPDATE_STATUS = 'threeSixty/report/UPDATE_STATUS'
const DOWNLOAD_REPORT = 'threeSixty/report/DOWNLOAD_REPORT'
const CHECK_REPORT = 'threeSixty/report/CHECK_REPORT'

export const fetchReport = (campaignId, id, lang) => ({
  type: FETCH_REPORTS,
  request: {
    url: `/threesixty_campaigns/${campaignId}/reports/${id}`,
    camelize: false,
    body: {
      lang,
    },
  },
})


export const updateStatus = (campaignId, id, status) => ({
  type: UPDATE_STATUS,
  request: {
    url: `/threesixty_campaigns/${campaignId}/reports/${id}/update_status`,
    method: 'put',
    body: {
      status,
    },
  },
})

export const downloadReport = (campaignId, id, lang) => ({
  type: DOWNLOAD_REPORT,
  request: {
    url: `/threesixty_campaigns/${campaignId}/reports/${id}/download`,
    body: { lang },
  },
})

export const checkReport = (campaignId, id) => ({
  type: CHECK_REPORT,
  request: {
    url: `/threesixty_campaigns/${campaignId}/reports/${id}/check_report`,
  },
})

export const defaultState = {
  loaded: false,
  user: {},
  options: { reports: { approval: {}, access: {} } },
  report: {},
  results: {},
}

const HANDLERS = {
  [FETCH_REPORTS]: (state, action) => ({
    ...humps.camelizeKeys(action.response),
    user: action.response.user,
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
