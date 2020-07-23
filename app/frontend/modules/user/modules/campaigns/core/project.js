import _ from 'lodash'

export const defaultState = {
  logo: null,
  secondaryLogo: null,
}

export const get = state => _.get(state, ['campaigns', 'project'])
export const getPrivacyText = state => _.get(get(state), ['privacyText'])
export const privacyPageLink = state => _.get(get(state), ['privacyPageLink'])
export const getLogo = state => _.get(get(state), ['logo'])
export const getSecondaryLogo = state => _.get(get(state), ['secondaryLogo'])
export const getName = state => _.get(get(state), ['name'])

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    default:
      return state
  }
}
