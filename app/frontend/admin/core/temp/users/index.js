const SEARCH_USERS = 'temp/users/SEARCH_USERS'
export const defaultState = []

export const searchUsers = (clientId, projectId, q) => ({
  type: SEARCH_USERS,
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
    case SEARCH_USERS:
      return action.response
    default:
      return state
  }
}
