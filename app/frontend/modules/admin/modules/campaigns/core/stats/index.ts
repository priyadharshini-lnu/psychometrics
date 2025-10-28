import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import dayjs from '~/utils/dayjs'
import { RootState } from '~/modules/admin/core/rootReducers'
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

export interface DataSheetFilterOptions {
  [key: string]: (string | number | null)[]
}

export interface Stats {
  users: Partial<UserStats>
  timeseries: Timeseries[]
  assessments: AssesmentStats[]
  dataSheetFilterOptions: DataSheetFilterOptions
}

const defaultState: Stats = {
  users: {},
  timeseries: [],
  assessments: [],
  dataSheetFilterOptions: {},
}

export const get = (state: RootState): Stats => _.get(state, ['campaigns', 'stats'])
export const getTimeseries = (state): Stats['timeseries'] => get(state).timeseries
export const getUsers = (state): Stats['users'] => get(state).users
export const getAssessments = (state): Stats['assessments'] => get(state).assessments
export const getDataSheetFilterOptions = (state: RootState): DataSheetFilterOptions => get(state).dataSheetFilterOptions

export const FETCH = 'campaigns/stats/FETCH'
export const FETCH_TIMESERIES = 'campaigns/stats/FETCH_TIMESERIES'
export const FETCH_WITH_DATA_SHEET_COLUMNS = 'campaigns/stats/FETCH_WITH_DATA_SHEET_COLUMNS'
export const FETCH_DATASHEET_FILTER_OPTIONS = 'campaigns/stats/FETCH_DATASHEET_FILTER_OPTIONS'

export const fetch = (
  campaignId: string,
  status: boolean[],
  dataSheetColumns: Record<string, (string | number | null)[]> = {},
) => ({
  type: FETCH,
  request: {
    method: 'post',
    debounce: 500,
    camelize: false,
    decamelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats`,
    body: {
      filters: {
        campaign_users_active_in: status,
        ...(Object.keys(dataSheetColumns).length > 0 && { data_sheet_columns: dataSheetColumns }),
      },
    },
  },
})

export const fetchTimeseries = (
  campaignId: string,
  range: [dayjs.Dayjs, dayjs.Dayjs],
  status: boolean[],
  dataSheetColumns: Record<string, (string | number | null)[]> = {},
) => ({
  type: FETCH_TIMESERIES,
  request: {
    method: 'post',
    debounce: 500,
    camelize: false,
    decamelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats/timeseries`,
    body: {
      range: range.map(r => r.toISOString()),
      campaign_users_active_in: status,
      ...(Object.keys(dataSheetColumns).length > 0 && { data_sheet_columns: dataSheetColumns }),
    },
  },
})

export const fetchDataSheetFilterOptions = (campaignId: string) => ({
  type: FETCH_DATASHEET_FILTER_OPTIONS,
  request: {
    method: 'get',
    debounce: 500,
    camelize: false,
    decamelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats/datasheet_filter_options`,
  },
})

export const fetchWithDataSheetColumns = (
  campaignId: string,
  range: [dayjs.Dayjs, dayjs.Dayjs],
  status: boolean[],
  dataSheetColumns: Record<string, (string | number)[]>,
) => ({
  type: FETCH_WITH_DATA_SHEET_COLUMNS,
  request: {
    method: 'post',
    debounce: 500,
    camelize: false,
    decamelize: false,
    url: `/administration/new_campaigns/${campaignId}/stats/timeseries`,
    body: {
      range: range.map(r => r.toISOString()),
      campaign_users_active_in: status,
      data_sheet_columns: dataSheetColumns,
    },
  },
})

type FetchType = ApiActionResponse<{ users: Stats['users'], assessments: Stats['assessments'] }>
type FetchTimeseriesType = ApiActionResponse<Stats['timeseries']>
type FetchWithDataSheetColumnsType = ApiActionResponse<Stats['timeseries']>
type FetchDataSheetFilterOptionsType = ApiActionResponse<DataSheetFilterOptions>

const HANDLERS = {
  [FETCH]: (state: Stats, { response }: FetchType) => ({ ...state, ...response }),
  [FETCH_TIMESERIES]: (state: Stats, { response }: FetchTimeseriesType) => (
    { ...state, timeseries: response }
  ),
  [FETCH_WITH_DATA_SHEET_COLUMNS]: (state: Stats, { response }: FetchWithDataSheetColumnsType) => (
    { ...state, timeseries: response }
  ),
  [FETCH_DATASHEET_FILTER_OPTIONS]: (state: Stats, action: FetchDataSheetFilterOptionsType) => ({
    ...state,
    dataSheetFilterOptions: action.response,
  }),
}

export default createReducer(HANDLERS, defaultState)
