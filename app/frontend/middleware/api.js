import axios from 'axios'
import queryString from 'query-string'
import humps from 'humps'
import _ from 'lodash'
import { LOADING, LOADING_COMPLETE } from 'admin/core/temp/request'

const buildUrl = ({ method = 'get', url, body }) => {
  if (method !== 'get') return url
  const normalizedBody = _.transform(
    humps.decamelizeKeys(body),
    (res, v, k) => {
      if (_.isPlainObject(v)) {
        res[k] = JSON.stringify(v)
      } else {
        res[k] = v
      }
      return res
    },
    {},
  )
  return `${url}?${queryString.stringify(normalizedBody, { arrayFormat: 'bracket' })}`
}

const buildOptions = ({ options: options = {} }) => ({
  ...options,
  headers: {
    ...options.headers,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-CSRF-Token': window.$('meta[name="csrf-token"]').attr('content'),
  },
})

const apiMiddleware = () => next => (action) => {
  if (!action.request) return next(action)

  const {
    request,
    request: {
      method: method = 'get', body = {}, loader, camelize = true,
    },
  } = action
  const REQUEST = `${action.type}_REQUEST`
  const SUCCESS = action.type
  const FAILURE = `${action.type}_FAILURE`

  next({ ...action, type: REQUEST })
  if (loader) { next({ type: LOADING, payload: { name: SUCCESS } }) }

  return axios.request({
    method,
    url: buildUrl(request),
    data: body instanceof FormData ? body : humps.decamelizeKeys(body),
    ...buildOptions(request),
    responseType: 'json',
    withCredentials: true,
  }).then(({ data }) => next({
    type: SUCCESS,
    response: camelize ? humps.camelizeKeys(data) : data,
    requestAction: action,
  })).catch((error) => {
    const errors = humps.camelizeKeys(error.response.data.errors)
    next({ type: FAILURE, errors: humps.camelizeKeys(errors) })
    throw (errors)
  }).finally(() => {
    if (loader) { next({ type: LOADING_COMPLETE }) }
  })
}

export default apiMiddleware
