import _ from 'lodash'
import Cookies from 'js-cookie'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { createReducer } from '~/utils/redux'
import { Config, Checks } from './interfaces'

interface State {
  checks: Checks
  config: Config
  preSignedUrl: string | null
  campaignId?: number
  id?: number
  url?: string
  transcribeSupportedLocales?: string[]
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
  },
  preSignedUrl: null,
}

export const FETCH = 'temp/checkingWizard/FETCH'
export const SET_COOKIES = 'temp/checkingWizard/SET_COOKIES'
export const PRE_SIGN_URL = 'temp/checkingWizard/PRE_SIGN_URL'

export const fetch = (assessmentId: number, id: number, type?: string): ApiAction<State> => ({
  type: FETCH,
  request:
  {
    method: 'get',
    url: `/system_checks/${assessmentId}/${id}`,
    body: { type },
  },
  userAssessmentId: id,
})

export const setCookies = (userAssessmentId: number, stepKey: string): ApiAction<State> => ({
  type: SET_COOKIES,
  request: {
    method: 'post',
    url: '/assessment_system_checks/step_completed',
    body: {
      user_assessment_id: userAssessmentId,
      step_key: stepKey,
    },
  },
  userAssessmentId,
})

export const preSignUrl = () => ({
  type: PRE_SIGN_URL,
  request:
  {
    method: 'get',
    url: '/transcribe/pre_sign_url',
  },
})

type FetchType = ReturnType<typeof fetch>
type PageSignType = ApiActionResponse<{ url: string }>

const HANDLERS = {
  [FETCH]: (state: State, request: FetchType) => {
    const { response, requestAction: { userAssessmentId } } = request
    const checks = _.reduce(response.checks, (result, value, key) => {
      let checkCompleted = false
      if (key === 'video') {
        checkCompleted = JSON.parse(Cookies.get('checking_wizard.video') || '{}')[userAssessmentId]
      } else {
        checkCompleted = Cookies.get(`checking_wizard.${key}`)
      }
      return { ...result, [key]: value && !checkCompleted }
    }, {})
    return { ...state, ...response, checks }
  },
  [PRE_SIGN_URL]: (state: State, { response: { url } }: PageSignType) => ({ ...state, preSignedUrl: url }),
}

export default createReducer(HANDLERS, defaultState)
