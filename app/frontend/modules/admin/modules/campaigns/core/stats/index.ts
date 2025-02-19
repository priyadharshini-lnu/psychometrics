import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import dayjs from '~/utils/dayjs'
import { RootState } from '~/modules/reports/core/rootReducers'
import { createReducer } from '~/utils/redux'

interface UserStats {
  total: number
  not_started: number
  in_progress: number
  completed: number
  interrupted: number
  timed_out: number
}


export interface AssesmentStats {
  id: number
  name: string
  not_started: number
  in_progress: number
  completed: number
  ineligible: number
  interrupted: number
  timed_out: number
  status: string
  total: number
}

interface Timeseries {
  dt: string
  started: number
  completed: number
}

export interface Stats {
  users: Partial<UserStats>
  timeseries: Timeseries[]
  assessments: AssesmentStats[]
}

const defaultState: Stats = {
  users: {},
  timeseries: [],
  assessments: [],
}

export const get = (state: RootState): Stats => _.get(state, ['campaigns', 'stats'])
export const getTimeseries = (state): Stats['timeseries'] => get(state).timeseries
export const getUsers = (state): Stats['users'] => get(state).users
export const getAssessments = (state): Stats['assessments'] => get(state).assessments

export const FETCH = 'campaigns/stats/FETCH'
export const FETCH_TIMESERIES = 'campaigns/stats/FETCH_TIMESERIES'

export const fetch = (campaignId: string, status: boolean[]) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    camelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats`,
    tableConfig: {
      filters: {
        campaign_users_active_in: status,
      },
    },
  },
})

export const fetchTimeseries = (campaignId: string, range: [dayjs.Dayjs, dayjs.Dayjs], status: boolean[]) => ({
  type: FETCH_TIMESERIES,
  request: {
    method: 'post',
    debounce: 500,
    camelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats/timeseries`,
    body: {
      range: range.map(r => r.toISOString()),
      campaign_users_active_in: status,
    },
  },
})

type FetchType = ApiActionResponse<{ users: Stats['users'], assessments: Stats['assessments'] }>
type FetchTimeseriesType = ApiActionResponse<Stats['timeseries']>

const HANDLERS = {
  [FETCH]: (state: Stats, { response }: FetchType) => ({ ...state, ...response }),
  [FETCH_TIMESERIES]: (state: Stats, { response }: FetchTimeseriesType) => ({ ...state, timeseries: response }),
}

export default createReducer(HANDLERS, defaultState)
