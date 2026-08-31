import _ from 'lodash'
import { takeLatest, put } from 'redux-saga/effects'
import { getIn } from '~/utils/immutable'
import { FETCH_SINGLE as FETCH_PROJECT } from '~/modules/admin/modules/client/core/projects'

const CHANGE_LOCALE = 'threeSixty/users/CHANGE_LOCALE'
const SYNC = 'threeSixty/user/SYNC'
const UPLOAD_PHOTO = 'threeSixty/user/UPLOAD_PHOTO'
const SET_USER = 'threeSixty/user/SET_USER'
export const CHANGE_PASSWORD = 'endUser/CHANGE_PASSWORD'

export const get = state => _.get(state, ['currentUser'])
export const getPermissions = state => _.get(get(state), ['permissions'])
export function isSuperAdmin (user) {
  return user.role === 'Users::SuperAdmin'
}

export function isSupportAdmin (user) {
  return Boolean(user.supportAdmin ?? user.support_admin)
}

export function hasGrant (user, scope, action) {
  if (isSuperAdmin(user)) return true
  return getIn(user.grants, scope, []).includes(action)
}

export const defaultState = null


const isNotEndUser = ['admin', 'administration', 'assessors'].includes(window.location.pathname.split('/')[1])

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  request: {
    method: 'post',
    url: isNotEndUser ? '/api/v2/administration/users/change_locale' : '/users/change_locale',
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
    contentType: 'multipart/form-data;',
  },
})

export const UPLOAD_FILES = 'resource/users/UPLOAD_FILES'

export const uploadAdminUserPhoto = data => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    url: '/api/v2/administration/users/uploads',
    body: data,
    contentType: 'multipart/form-data;',
  },
})

export const setUser = user => ({
  type: SET_USER,
  payload: { user },
})


export const changePassword = data => ({
  type: CHANGE_PASSWORD,
  request: {
    method: 'patch',
    url: '/users/change_password',
    body: data,
    loader: true,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case UPLOAD_PHOTO:
      return { ...state, photo: action.response.photo }
    case SET_USER:
      return action.payload.user
    case SYNC:
      return action.response
    case FETCH_PROJECT:
      return action.response.currentUser
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
