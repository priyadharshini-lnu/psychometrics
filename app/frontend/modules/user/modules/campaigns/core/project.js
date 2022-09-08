import _ from 'lodash'

const ACCEPT_POLICY = 'project/ACCEPT_POLICY'

export const defaultState = {
  logo: null,
  secondaryLogo: null,
}

export const get = state => _.get(state, ['campaigns', 'project'])
export const getPrivacyText = state => _.get(get(state), ['privacyText'])
export const privacyPageLink = state => _.get(get(state), ['privacyPageLink'])
export const getLogo = state => _.get(get(state), ['logo'])
export const getProjectLogo = state => _.get(state, ['config', 'design', 'logo'])
export const getSecondaryLogo = state => _.get(state, ['config', 'design', 'secondary_logo'])
export const getName = state => _.get(get(state), ['name'])

export const acceptPolicy = () => ({
  type: ACCEPT_POLICY,
  request: {
    method: 'POST',
    url: '/accept_privacy',
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    default:
      return state
  }
}
