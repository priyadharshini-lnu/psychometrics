import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { RootState } from '~/modules/admin/core/rootReducers'

const FETCH = 'ui/breadcrumbs/FETCH'

export interface Request {
  fields: string[]
  data: {
    campaignId?: number
    projectId?: number
    clientId?: number
    threesixtyId?: number
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
    tags?: string[],
  }
  threesixty: {
    id?: number,
    name?: string,
  }
}

export const defaultState: State = {
  client: { },
  project: { },
  campaign: { },
  threesixty: { },
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

export const getProject = (state: RootState) => state.ui.breadcrumbs.project

export default createReducer(HANDLERS, defaultState)
