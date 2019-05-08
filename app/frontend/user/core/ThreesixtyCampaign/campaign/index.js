import { setIn } from 'utils/immutable'

const FETCH = 'threeSixty/campaign/FETCH'

export const fetchCampaign = campaignId => ({
  type: FETCH,
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
  [FETCH]: (state, action) => {
    let newState = setIn(state, ['nominations', 0, 'list'], action.response.nominations)
    newState = setIn(newState, ['nominations', 1, 'list'], action.response.managerNominations)
    newState = setIn(newState, ['evaluations', 0, 'list'], action.response.evaluations)
    newState = setIn(newState, ['evaluations', 1, 'list'], action.response.managerEvaluations)

    return newState
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
