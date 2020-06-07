import { createReducer } from 'utils/reduxUtils'
import { Config, Checks } from './interfaces'

interface State {
 checks: Checks
 config: Config
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
}

export const FETCH = 'temp/checkingWizard/FETCH'

export const fetch = (assessmentId: number, id: number) => ({
  type: FETCH,
  request:
    {
      method: 'get',
      url: `/system_checks/${assessmentId}/${id}`,
    },
})


const HANDLERS = {
  [FETCH]: (state: State, { response }) => ({ ...state, ...response }),
}


export default createReducer(HANDLERS, defaultState)
