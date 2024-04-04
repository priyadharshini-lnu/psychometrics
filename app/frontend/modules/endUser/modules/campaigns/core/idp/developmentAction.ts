import humps from 'humps'
import _ from 'lodash'

const FETCH_USER_IDP_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_USER_IDP_DEVELOPMENT_ACTIONS'
const FETCH_USER_IDP_SKILLS = 'IDP/MY_PLAN/FETCH_USER_IDP_SKILLS'
const FETCH_AVAILABLE_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_AVAILABLE_DEVELOPMENT_ACTIONS'

export const fetchUserIdpDevelopmentActions = () => ({
  type: FETCH_USER_IDP_DEVELOPMENT_ACTIONS,
  request: {
    url: '/user_idp_development_actions',
    camelize: false,
  },
})

export const fetchUserIdpSkills = () => ({
  type: FETCH_USER_IDP_SKILLS,
  request: {
    url: '/user_idp_development_actions/user_idp_skills',
    camelize: false,
  },
})

export const fetchAvailableDevelopmentActions = () => ({
  type: FETCH_AVAILABLE_DEVELOPMENT_ACTIONS,
  request: {
    url: '/user_idp_development_actions/available_development_actions',
    camelize: false,
  },
})

export const defaultState = {
  user_idp_development_actions: {},
  user_idp_skills: {},
}

const HANDLERS = {
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
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
