import { takeLatest, put } from 'redux-saga/effects'

const FETCH_SUBJECTS = 'threeSixty/subjects/FETCH_SUBJECTS'
export const CREATE_ALL = 'threeSixty/subjects/CREATE_ALL'
export const defaultState = []

export const fetchSubjects = campaignId => ({
  type: FETCH_SUBJECTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/subjects`,
  },
})

export const createAll = (campaignId, subjects) => ({
  type: CREATE_ALL,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/subjects/create_all`,
    body: { subjects },
  },
})


export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_SUBJECTS:
      return action.response
    default:
      return state
  }
}

function* refetchSubjects ({ requestAction }) {
  yield put(fetchSubjects(requestAction.campaignId))
}

export const watchers = [
  takeLatest(CREATE_ALL, refetchSubjects),
]
