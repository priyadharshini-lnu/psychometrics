import _ from 'lodash'

export const FETCH = 'project/FETCH_POLICY'
export const ACCEPT_POLICY = 'project/ACCEPT_POLICY'

export const defaultState = {
  logo: null,
  secondaryLogo: null,
  policy: null,
}

export const get = state => _.get(state, ['campaigns', 'project'])
export const getPrivacyText = state => _.get(get(state), ['privacyText'])
export const privacyPageLink = state => _.get(get(state), ['privacyPageLink'])
export const enablePrivacyLink = state => _.get(get(state), ['enablePrivacyLink'])
export const getProjectPrivacyLinkAndText = state => ({
  text: getPrivacyText(state),
  link: privacyPageLink(state),
  enabled: enablePrivacyLink(state),
})
export const getLogo = state => _.get(get(state), ['logo'])
export const getProjectLogo = state => _.get(state, ['config', 'design', 'logo'])
export const getSecondaryLogo = state => _.get(state, ['config', 'design', 'secondary_logo'])
export const getSecondaryLogoAltText = state => _.get(state, ['config', 'design', 'secondary_logo_alt_text'])
export const getLogoAltText = state => _.get(state, ['config', 'design', 'logo_alt_text'])
export const getName = state => _.get(get(state), ['name'])


export const fetchPolicy = (version = '2') => ({
  type: FETCH,
  request: {
    url: `/policy/v${version}.json`,
  },
})

export const acceptPolicy = payload => ({
  type: ACCEPT_POLICY,
  request: {
    method: 'POST',
    url: '/accept_privacy',
    body: payload,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH:
      return { ...state, policy: action.response }
    default:
      return state
  }
}
