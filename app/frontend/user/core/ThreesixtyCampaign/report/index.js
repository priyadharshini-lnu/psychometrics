import humps from 'humps'

const FETCH_REPORTS = 'threeSixty/report/FETCH_REPORTS'

export const fetchReport = (campaignId, id) => ({
  type: FETCH_REPORTS,
  request: {
    url: `/campaigns/${campaignId}/reports/${id}`,
    camelize: false,
  },
})

export const defaultState = {
  loaded: false,
  user: {},
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
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
