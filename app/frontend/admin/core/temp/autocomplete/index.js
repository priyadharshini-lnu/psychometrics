const SEARCH_USERS_IN_PROJECT = 'temp/users/SEARCH_USERS_IN_PROJECT'
export const defaultState = {
  users: []
}

export const searchUsersInProject = (clientId, projectId, q) => ({
  type: SEARCH_USERS_IN_PROJECT,
  request: {
    method: 'post',
    url: `/administration/clients/470/projects/${projectId}/search_users`,
    body: {
      q,
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case SEARCH_USERS_IN_PROJECT:
      return { ...state, users: action.response }
    default:
      return state
  }
}
