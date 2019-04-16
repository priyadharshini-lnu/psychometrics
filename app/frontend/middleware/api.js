import axios from 'axios'
import queryString from 'query-string'
import humps from 'humps'

const buildUrl = ({ method = 'get', url, body }) => {
  if (method !== 'get') return url
  const normalizedBody = _.transform(
    body,
    (res, v, k) => {
      if (_.isPlainObject(v)) {
        res[k] = JSON.stringify(v)
      }
      return res
    },
    {},
  )
  return `${url}?${queryString.stringify(normalizedBody, { arrayFormat: 'bracket' })}`
}

const apiMiddleware = () => next => (action) => {
  if (!action.request) return next(action)

  const {
    request,
    request: { method: method = 'get', options: options = {}, body },
  } = action
  const REQUEST = `${action.type}_REQUEST`
  const SUCCESS = action.type
  const FAILURE = `${action.type}_FAILURE`

  next({ ...action, type: REQUEST })

  return axios[method](buildUrl(request), body, options)
    .then(({ data }) => next({ type: SUCCESS, data: humps.camelizeKeys(data), requestAction: action }))
    .catch(error => next({ type: FAILURE, error }))
}

export default apiMiddleware
