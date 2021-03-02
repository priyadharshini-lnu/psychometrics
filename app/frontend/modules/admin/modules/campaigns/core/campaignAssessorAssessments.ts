import { RootState } from 'modules/admin/core/rootReducers'
import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { FETCH_ASSESSMENTS_AND_REPORTS } from './current'

export const get = (state: RootState) => _.get(state, ['campaigns', 'campaignAssessorAssessments'])

interface Assessment {
  id: number
  name: string
}
type State = Assessment[]

const defaultState: State = []

type FetchType = ApiActionResponse<{ assessorAssessments: State }>

const HANDLERS = {
  [FETCH_ASSESSMENTS_AND_REPORTS]: (_: State, { response }: ApiActionResponse<FetchType>) => (
    response.assessorAssessments
  ),
}

export default createReducer(HANDLERS, defaultState)
