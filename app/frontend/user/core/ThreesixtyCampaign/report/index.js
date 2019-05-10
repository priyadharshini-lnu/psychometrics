const FETCH_REPORTS = 'threeSixty/report/FETCH_REPORTS'

export const fetchReport = campaignId => ({
  type: FETCH_REPORTS,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {}

const HANDLERS = {
  [FETCH_REPORTS]: state => state, // do nothing action.data,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
