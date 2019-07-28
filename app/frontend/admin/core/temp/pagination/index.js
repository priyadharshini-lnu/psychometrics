import reduxUtils from 'utils/reduxUtils'
import queryString from 'query-string'

const UPDATE = 'temp/pagination/UPDATE'

export const update = page => ({ type: UPDATE, page })

const defaultState = { page: parseInt(queryString.parse(location.search).page, 10) || 1 }

const HANDLERS = {
  [UPDATE]: (state, { page }) => ({ ...state, page }),
}

export default reduxUtils.combineHandlers(HANDLERS, defaultState)
