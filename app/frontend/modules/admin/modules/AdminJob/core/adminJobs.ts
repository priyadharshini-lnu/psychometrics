import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { AdminJob } from '../interfaces'

interface State {
  list: AdminJob[]
  unread: number
  hasMore: boolean
}

interface FetchResponse{
  unread: number
  jobs: AdminJob[]
}

type ReadResponse = AdminJob

export const defaultState: State = {
  list: [],
  unread: 0,
  hasMore: true,
}

export const getAll = (state): AdminJob[] => state.adminJobs.list
export const getUnread = (state): number => state.adminJobs.unread
export const getHasMore = (state): boolean => state.adminJobs.hasMore

export const FETCH = 'adminJobs/FETCH'
export const CREATE = 'adminJobs/CREATE'
export const UPDATE = 'adminJobs/UPDATE'
export const READ = 'adminJobs/READ'
export const READ_ALL = 'adminJobs/READ_ALL'

export const fetch = (offset: number): ApiAction<State> => ({
  type: FETCH,
  request:
    {
      method: 'get',
      url: '/administration/admin_jobs',
      body: {
        offset,
      },
    },
})

export const create = (job: AdminJob) => ({
  type: CREATE,
  payload: {
    job,
  },
})


export const update = (job: AdminJob) => ({
  type: UPDATE,
  payload: {
    job,
  },
})

export const readAll = (): ApiAction<State> => ({
  type: READ_ALL,
  request:
    {
      method: 'put',
      url: '/administration/admin_jobs/read_all',
    },
})

export const read = (id: number): ApiAction<State> => ({
  type: READ,
  request:
    {
      method: 'put',
      url: `/administration/admin_jobs/${id}/read`,
    },
})

type FetchType = ApiActionResponse<FetchResponse>
type CreateType = ReturnType<typeof create>
type UpdateType = ReturnType<typeof update>
type ReadType = ApiActionResponse<ReadResponse>

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchType) => ({
    ...state,
    list: [...state.list, ...response.jobs],
    unread: response.unread,
    hasMore: response.jobs.length > 0,
  }),
  [CREATE]: (state: State, { payload }: CreateType) => ({
    ...state, list: [payload.job, ...state.list], unread: state.unread + 1,
  }),
  [UPDATE]: (state: State, { payload }: UpdateType) => {
    const list = state.list.map(job => (job.id === payload.job.id ? payload.job : job))
    return { ...state, list }
  },
  [READ_ALL]: (state: State) => {
    const list = state.list.map(job => ({ ...job, read: true }))
    return { ...state, unread: 0, list }
  },
  [READ]: (state: State, { response }: ReadType) => {
    const list = state.list.map((job) => {
      if (response.id === job.id) return response

      return job
    })
    return { ...state, unread: state.unread - 1, list }
  },
}

export default createReducer(HANDLERS, defaultState)
