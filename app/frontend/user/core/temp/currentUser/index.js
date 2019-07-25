const CHANGE_LOCALE = 'temp/users/CHANGE_LOCALE'
export const defaultState = null

export const changeLocale = locale => ({
  type: CHANGE_LOCALE,
  request: {
    method: 'post',
    url: '/campaigns/change_locale',
    body: {
      locale,
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    default:
      return state
  }
}
