import { DEPRECATED_createReducer } from 'utils/redux'
import ApiAction from 'interfaces/ApiAction'
import { AdminJob } from '../interfaces'

interface State {
 list: AdminJob[]
 unread: number
 hasMore: boolean
}

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

const HANDLERS = {
  [FETCH]: (state: State, { response }) => ({
    ...state,
    list: [...state.list, ...response.jobs],
    unread: response.unread,
    hasMore: response.jobs.length > 0,
  }),
  [CREATE]: (state: State, { payload }) => ({ list: [payload.job, ...state.list], unread: state.unread + 1 }),
  [UPDATE]: (state: State, { payload }) => {
    const list = state.list.map(job => (job.id === payload.job.id ? payload.job : job))
    return { ...state, list }
  },
  [READ_ALL]: (state: State) => {
    const list = state.list.map(job => ({ ...job, read: true }))
    return { ...state, unread: 0, list }
  },
  [READ]: (state: State, { response }) => {
    const list = state.list.map((job) => {
      if (response.id === job.id) return response

      return job
    })
    return { ...state, unread: state.unread - 1, list }
  },
}


export default DEPRECATED_createReducer(HANDLERS, defaultState)
