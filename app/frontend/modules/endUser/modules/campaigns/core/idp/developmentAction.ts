import { DevelopmentAction } from 'components/IdpShared/DevelopmentActions'
import humps from 'humps'
import _ from 'lodash'

const FETCH_USER_IDP_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_USER_IDP_DEVELOPMENT_ACTIONS'
const FETCH_USER_IDP_SKILLS = 'IDP/MY_PLAN/FETCH_USER_IDP_SKILLS'
const FETCH_AVAILABLE_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_AVAILABLE_DEVELOPMENT_ACTIONS'
const ADD_DEVELOPMENT_ACTION = 'IPD/MY_PLAN/ADD_DEVELOPMENT_ACTION'
const UPDATE_DEVELOPMENT_ACTION = 'IPD/MY_PLAN/UPDATE_DEVELOPMENT_ACTION'
const SAVE_DEVELOPMENT_ACTIONS = 'IPD/MY_PLAN/SAVE_DEVELOPMENT_ACTIONS'
const FETCH_DIRECT_REPORTS = 'IDP/MY_PLAN/FETCH_DIRECT_REPORTS'
const UPDATE_DEVELOPMENT_ACTION_PROGRESS = 'IPD/MY_PLAN/UPDATE_DEVELOPMENT_ACTION_PROGRESS'

export const fetchDirectReports = () => ({
  type: FETCH_DIRECT_REPORTS,
  request: {
    url: '/direct_reports',
  },
})

export const fetchUserIdpDevelopmentActions = (userId: string) => ({
  type: FETCH_USER_IDP_DEVELOPMENT_ACTIONS,
  request: {
    url: `/user_idp_development_actions?user_id=${userId}`,
    camelize: false,
  },
})

export const saveUserIdpDevelopmentActions = (userId: string, data: Partial<DevelopmentAction>[]) => ({
  type: SAVE_DEVELOPMENT_ACTIONS,
  request: {
    url: `/user_idp_development_actions/save_plan?user_id=${userId}`,
    camelize: false,
    method: 'post',
    body: { user_idp_development_action: data },
  },
})

export const addDevelopmentActionInPlan = (developmentAction: Partial<DevelopmentAction>) => ({
  type: ADD_DEVELOPMENT_ACTION,
  data: developmentAction,
})

export const updateDevelopmentActionInPlan = (developmentAction: Partial<DevelopmentAction>) => ({
  type: UPDATE_DEVELOPMENT_ACTION,
  data: developmentAction,
})

export const updateDevelopmentActionProgressInPlan = (
  developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>,
) => ({
  type: UPDATE_DEVELOPMENT_ACTION_PROGRESS,
  request: {
    url: '/user_idp_development_actions/update_progress',
    camelize: false,
    method: 'put',
    body: developmentAction,
  },
})

export const fetchUserIdpSkills = (userId: string) => ({
  type: FETCH_USER_IDP_SKILLS,
  request: {
    url: `/user_idp_development_actions/user_idp_skills?user_id=${userId}`,
    camelize: false,
  },
})

export const fetchAvailableDevelopmentActions = (userId: string) => ({
  type: FETCH_AVAILABLE_DEVELOPMENT_ACTIONS,
  request: {
    url: `/user_idp_development_actions/available_development_actions?user_id=${userId}`,
    camelize: false,
  },
})

export const defaultState = {
  userIdpDevelopmentActions: {},
  userIdpSkills: {},
  directReports: [],
}

const HANDLERS = {
  [FETCH_DIRECT_REPORTS]: (state, action) => ({
    ...state,
    directReports: action.response.data,
  }),
  [FETCH_USER_IDP_DEVELOPMENT_ACTIONS]: (state, action) => ({
    ...state,
    userIdpDevelopmentActions: _.keyBy(humps.camelizeKeys(action.response.data), 'id'),
  }),
  [FETCH_USER_IDP_SKILLS]: (state, action) => ({
    ...state,
    userIdpSkills: _.keyBy(humps.camelizeKeys(action.response.data), 'id'),
  }),
  [FETCH_AVAILABLE_DEVELOPMENT_ACTIONS]: (state, action) => ({
    ...state,
    availableDevelopmentActions: _.keyBy(humps.camelizeKeys(action.response.data), 'id'),
  }),
  [UPDATE_DEVELOPMENT_ACTION]: (state, action) => {
    const newDevelopmentAction = action.data
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [newDevelopmentAction.id]: {
          ...state.userIdpDevelopmentActions[newDevelopmentAction.id],
          ...newDevelopmentAction,
        },
      },
    }
  },
  [UPDATE_DEVELOPMENT_ACTION_PROGRESS]: (state, action) => {
    const newDevelopmentAction = action.response
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [newDevelopmentAction.id]: {
          ...state.userIdpDevelopmentActions[newDevelopmentAction.id],
          ...newDevelopmentAction,
        },
      },
    }
  },
  [ADD_DEVELOPMENT_ACTION]: (state, action) => {
    const developmentAction = action.data
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [developmentAction.id]: developmentAction,
      },
    }
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
