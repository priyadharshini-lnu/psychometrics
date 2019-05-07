import { setIn } from 'utils/immutable'

const FETCH_CAMPAIGN = 'threeSixty/campaign/FETCH_CAMPAIGN'

export const fetchCampaign = campaignId => ({
  type: FETCH_CAMPAIGN,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {
  nominations: [
    {
      title: 'Set up nominations',
      list: [],
    },
    {
      title: 'Approve nominations',
      list: [],
    },
  ],
  evaluations: [
    {
      title: 'Evaluations',
      list: [
      ],
    },
    {
      title: 'Approve evaluations',
      list: [
      ],
    },
  ],
  reports: [{
    title: 'Reports',
    users: [
    ],
  },
  {
    title: 'Approve reports',
    users: [
    ],
  }],
}

const HANDLERS = {
  [FETCH_CAMPAIGN]: (state, action) => {
    let newState = setIn(state, ['nominations', 0, 'list'], action.response.nominations)
    newState = setIn(newState, ['nominations', 1, 'list'], action.response.managerNominations)
    newState = setIn(newState, ['evaluations', 0, 'list'], action.response.evaluations)
    newState = setIn(newState, ['evaluations', 1, 'list'], action.response.managerEvaluations)

    return newState
  },
}

// TODO: replace mockdata with defaultState
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
