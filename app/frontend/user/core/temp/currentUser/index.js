export const defaultState = null

export const logout = () => ({
  request: {
    method: 'delete',
    url: '/users/sign_out',
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    default:
      return state
  }
}
