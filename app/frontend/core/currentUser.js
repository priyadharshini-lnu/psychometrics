import _ from 'lodash'
import { getIn } from 'utils/immutable'
import { takeLatest, put } from 'redux-saga/effects'

const CHANGE_LOCALE = 'threeSixty/users/CHANGE_LOCALE'
const SYNC = 'threeSixty/user/SYNC'
const UPLOAD_PHOTO = 'threeSixty/user/UPLOAD_PHOTO'
const SET_USER = 'threeSixty/user/SET_USER'

export const get = state => _.get(state, ['currentUser'])

export function isSuperAdmin (user) {
  return user.role === 'Users::SuperAdmin'
}

export function hasGrant (user, scope, action) {
  return getIn(user.grants, scope, []).includes(action)
}

export const defaultState = null

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  request: {
    method: 'post',
    url: '/users/change_locale',
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
    camelizeErrors: false,
  },
})

export const uploadPhoto = formData => ({
  type: UPLOAD_PHOTO,
  request: {
    method: 'patch',
    url: '/users/upload_photo',
    body: formData,
  },
})


export const setUser = user => ({
  type: SET_USER,
  payload: { user },
})


export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case UPLOAD_PHOTO:
      return { ...state, photo: action.response.photo }
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
