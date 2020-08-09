import { createReducer } from 'utils/redux'
import _ from 'lodash'
import Cookies from 'js-cookie'
import ApiAction from 'interfaces/ApiAction'
import { Config, Checks } from './interfaces'

interface State {
 checks: Checks
 config: Config
 preSignedUrl: string | null
}

export const defaultState: State = {
  checks: {
    video: false,
    audio: false,
    network: false,
  },
  config: {
    network: {
      upload: 0,
      download: 0,
    },
    speedOfMeApiToken: '',
  },
  preSignedUrl: null,
}

export const FETCH = 'temp/checkingWizard/FETCH'
export const PRE_SIGN_URL = 'temp/checkingWizard/PRE_SIGN_URL'

export const fetch = (assessmentId: number, id: number): ApiAction<State> => ({
  type: FETCH,
  request:
    {
      method: 'get',
      url: `/system_checks/${assessmentId}/${id}`,
    },
})

export const preSignUrl = () => ({
  type: PRE_SIGN_URL,
  request:
    {
      method: 'get',
      url: '/transcribe/pre_sign_url',
    },
})


const HANDLERS = {
  [FETCH]: (state: State, { response }) => {
    const checks = _.reduce(response.checks, (result, value, key) => (
      { ...result, [key]: value && !Cookies.get(`checking_wizard.${key}`) }
    ), {})
    return { ...state, ...response, checks }
  },
  [PRE_SIGN_URL]: (state: State, { response: { url } }) => ({ ...state, preSignedUrl: url }),
}


export default createReducer(HANDLERS, defaultState)
