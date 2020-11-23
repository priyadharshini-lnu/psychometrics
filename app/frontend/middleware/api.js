import axios from 'axios'
import queryString from 'qs'
import humps from 'humps'
import { LOADING, LOADING_COMPLETE, setResponseDataMismatched } from 'modules/admin/core/request'
import { setIn } from 'utils/immutable'
import _ from 'lodash'
import fileDownload from 'js-file-download'
import { isRight } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'

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

const buildOptions = ({ options = {} }) => ({
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
      method = 'get', body = {}, loader, camelize = true, decamelize = true, responseType, typedResponse,
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
      const transformedData = camelize ? humps.camelizeKeys(data) : data
      if (window.PsyGlobalState.realEnv !== 'production' && !validResponseData({
        typedResponse, transformedData, requestName: SUCCESS, next,
      })) {
        return next({ type: FAILURE, errors: {} })
      }
      return next({
        type: SUCCESS,
        response: transformedData,
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

const validResponseData = ({
  typedResponse, transformedData, requestName, next,
}) => {
  if (typedResponse) {
    const decoded = typedResponse.decode(transformedData)
    const dataIsValid = isRight(decoded)
    if (!dataIsValid) {
      const errors = PathReporter.report(typedResponse.decode(transformedData))
      next(setResponseDataMismatched(requestName, errors, transformedData))
      return false
    }
  }
  return true
}

export default apiMiddleware
