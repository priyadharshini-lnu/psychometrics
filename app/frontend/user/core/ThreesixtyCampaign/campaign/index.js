import { setIn } from 'utils/immutable'

const FETCH = 'threeSixty/campaign/FETCH'

export const fetchCampaign = campaignId => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {
  nominations: [],
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
    let newState = setIn(state, ['nominations'], action.response.nominations)
    newState = setIn(newState, ['evaluations', 0, 'list'], action.response.evaluations)

    return newState
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
