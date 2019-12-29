import _ from 'lodash'
import { takeLatest, put } from 'redux-saga/effects'

const CHANGE_LOCALE = 'temp/users/CHANGE_LOCALE'
const LOGOUT = 'temp/users/LOGOUT'
const SYNC = 'threeSixty/user/SYNC'
const SET_USER = 'threeSixty/user/SET_USER'

export const get = state => _.get(state, ['threeSixtyCampaign', 'temp', 'currentUser'])

export const defaultState = null

export const logout = () => ({
  type: LOGOUT,
  request: {
    method: 'delete',
    url: '/users/sign_out',
  },
})

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  request: {
    method: 'post',
    url: '/campaigns/change_locale',
    body: {
      locale,
    },
  },
})

export const sync = data => ({
  type: SYNC,
  request: {
    method: 'patch',
    url: '/users/update_details',
    body: { user: data },
  },
})

export const setUser = user => ({
  type: SET_USER,
  payload: { user },
})


export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case SET_USER:
      return action.payload.user
    default:
      return state
  }
}

function* genSetUser ({ response }) {
  yield put(setUser(response))
}

export const watchers = [
  takeLatest(SYNC, genSetUser),
]
