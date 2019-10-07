import _ from 'lodash'

export const defaultState = {
  logo: null,
}

export const get = state => _.get(state, ['threeSixtyCampaign', 'temp', 'project'])
export const getPrivacyText = state => _.get(get(state), ['privacyText'])
export const privacyPageLink = state => _.get(get(state), ['privacyPageLink'])

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    default:
      return state
  }
}
