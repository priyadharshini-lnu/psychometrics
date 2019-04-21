const FETCH_NOMINATION = 'threeSixty/managers/FETCH_NOMINATION'

export const fetchNomination = campaignId => ({
  type: FETCH_NOMINATION,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const defaultState = {}

const HANDLERS = {
  [FETCH_NOMINATION]: (state, action) => state, // do nothing action.data,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
