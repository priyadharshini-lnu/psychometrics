import axios from 'axios'
import queryString from 'query-string'
import humps from 'humps'
import _ from 'lodash'

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
    request: { method: method = 'get', body = {} },
  } = action
  const REQUEST = `${action.type}_REQUEST`
  const SUCCESS = action.type
  const FAILURE = `${action.type}_FAILURE`

  next({ ...action, type: REQUEST })
  return axios.request({
    method,
    url: buildUrl(request),
    data: body,
    ...buildOptions(request),
    responseType: 'json',
    withCredentials: true,
  }).then(({ data }) => next({ type: SUCCESS, response: humps.camelizeKeys(data), requestAction: action }))
    .catch((error) => {
      next({ type: FAILURE, errors: error.response.data.errors })
    })
}

export default apiMiddleware
