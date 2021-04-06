import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { FETCH } from '../list'

const defaultState = {}
type FetchType = ApiActionResponse<{permissions: {}}>

export const get = (state): {} => _.get(state, ['campaigns', 'permissions'])
export const getAssessmentPermissions = (state): {} => _.get(state,
  ['campaigns', 'permissions', 'assessmentPermissions'])

const HANDLERS = {
  [FETCH]: (_: {}, { response }: FetchType) => response.permissions,
}

export default createReducer(HANDLERS, defaultState)
