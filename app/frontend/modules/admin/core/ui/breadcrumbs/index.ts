import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'

const FETCH = 'ui/breadcrumbs/FETCH'

export interface Request {
  fields: string[]
  data: {
    campaignId?: number
    projectId?: number
  }
}

export interface State {
  client: {
    id?: number,
    name?: string,
  },
  project: {
    id?: number,
    name?: string,
  },
  campaign: {
    id?: number,
    name?: string,
  }
}

export const defaultState: State = {
  client: { },
  project: { },
  campaign: { },
}


export const fetch = (request: Request) => ({
  type: FETCH,
  request: {
    method: 'post',
    url: '/administration/breadcrumbs',
    body: request,
  },
})

export type fetchType = typeof fetch

export type FetchReturnType = ReturnType<typeof fetch>

const HANDLERS = {
  [FETCH]: (state: State, { response }: ApiActionResponse<State>): State => response,
}

export default createReducer(HANDLERS, defaultState)
