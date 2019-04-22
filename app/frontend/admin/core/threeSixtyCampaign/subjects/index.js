const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
export const defaultState = []

export const fetchSubjects = campaignId => ({
  type: FETCH_SUBJECTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_SUBJECTS:
      return action.data
    default:
      return state
  }
}
