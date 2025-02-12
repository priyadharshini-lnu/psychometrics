
export const EXTEND_SESSION = 'user/extend-session'
export const extendSession = () => ({
  type: EXTEND_SESSION,
  request: {
    url: '/extend_session',
    loader: true,
    method: 'POST',
  },
})
