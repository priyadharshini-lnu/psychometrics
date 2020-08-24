import axios from 'axios'
import queryString from 'qs'
import humps from 'humps'
import { LOADING, LOADING_COMPLETE } from 'modules/admin/core/request'
import { setIn } from 'utils/immutable'
import _ from 'lodash'
import fileDownload from 'js-file-download'

const debounceTimers = {}
const buildUrl = ({
  method = 'get', url, body, tableConfig,
}) => {
  if (method !== 'get') return url
  const normalizedBody = humps.decamelizeKeys({ ...bodyFromTableConfig(tableConfig), ...body })

  return `${url}?${queryString.stringify(normalizedBody, { arrayFormat: 'bracket' })}`
}

// Sends data in the format required by ransack gem
const bodyFromTableConfig = (tableConfig) => {
  if (!tableConfig) { return {} }

  const data = { filters: tableConfig.filters || {}, page: tableConfig.page }
  if (_.isEmpty(tableConfig.sort)) return data
  return setIn(data, ['filters', 's'], `${_.snakeCase(tableConfig.sort.columnName)} ${tableConfig.sort.order}`)
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
  if (!action || !action.request) return next(action)

  const {
    request,
    request: {
      method: method = 'get', body = {}, loader, camelize = true, decamelize = true, responseType,
    },
  } = action
  const REQUEST = `${action.type}_REQUEST`
  const SUCCESS = action.type
  const FAILURE = `${action.type}_FAILURE`

  next({ ...action, type: REQUEST })
  if (loader) {
    next({ type: LOADING, payload: { name: SUCCESS } })
  }

  const processApi = () => axios
    .request({
      method,
      url: buildUrl(request),
      data: (body instanceof FormData || !decamelize) ? body : humps.decamelizeKeys(body),
      ...buildOptions(request),
      responseType: responseType || 'json',
      withCredentials: true,
    })
    .then(({ data, headers }) => {
      if (responseType === 'blob') { downloadFile(data, headers) }
      next({
        type: SUCCESS,
        response: camelize ? humps.camelizeKeys(data) : data,
        requestAction: action,
      })
    })
    .catch((error) => {
      const errors = humps.camelizeKeys(error.response.data.errors)
      next({ type: FAILURE, errors: humps.camelizeKeys(errors) })
      throw errors
    })
    .finally(() => {
      if (loader) {
        next({ type: LOADING_COMPLETE })
      }
    })

  if (!request.debounce) return processApi()

  if (debounceTimers[action.type]) clearTimeout(debounceTimers[action.type])
  debounceTimers[action.type] = setTimeout(processApi, request.debounce)
  return debounceTimers[action.type]
}

const downloadFile = (data, headers) => {
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  const matches = filenameRegex.exec(headers['content-disposition'])
  let fileName = 'file_without_name'

  if (matches != null && matches[1]) {
    fileName = matches[1].replace(/['"]/g, '')
  }

  fileDownload(data, fileName)
}

export default apiMiddleware
