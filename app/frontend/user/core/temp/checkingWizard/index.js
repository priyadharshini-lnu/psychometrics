import { createReducer } from 'utils/reduxUtils'

export const defaultState = {
  checks: {
    video: false,
    audio: false,
    network: false,
  },
}

export const FETCH = 'temp/checkingWizard/FETCH'

export const fetch = (assessmentId, id) => ({
  type: FETCH,
  request:
    {
      method: 'get',
      url: `/system-checks/${assessmentId}/${id}`,
    },
})


const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, ...response }),
}


export default createReducer(HANDLERS, defaultState)
