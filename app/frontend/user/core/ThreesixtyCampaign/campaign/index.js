import { setIn } from 'utils/immutable'

const FETCH_CAMPAIGN = 'threeSixty/managers/FETCH_CAMPAIGN'

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
      evaluations: [
      ],
    },
    {
      title: 'Approve evaluations',
      evaluations: [
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
    const lists = _.cloneDeep(state.nominations)
    lists[0].list = action.response.nominations

    return {
      ...state,
      nominations: lists,
    }
  },
}

// TODO: replace mockdata with defaultState
export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
