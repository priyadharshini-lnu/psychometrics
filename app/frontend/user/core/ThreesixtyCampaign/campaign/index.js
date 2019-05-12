import { merge } from 'utils/immutable'

const FETCH = 'threeSixty/campaign/FETCH'

export const fetchCampaign = campaignId => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {
  nominations: [],
  evaluations: [],
  reports: [],
  options: {
    relationships: {
      manager: {},
      subject: {},
      evaluator: {},
    },
  },
}

const HANDLERS = {
  [FETCH]: (state, action) => merge(state, action.response),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
