import humps from 'humps'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'

const FETCH = 'anonym/FETCH'
const FETCH_FAILURE = 'anonym/FETCH_FAILURE'

export const fetchResult = (assessmentKey: string) => ({
  type: FETCH,
  request: {
    url: `/anonym/${assessmentKey}`,
    camelize: false,
    body: { cache: new Date().valueOf() },
  },
})

export interface Result {
  id: number
  campaign_id: number
  user_assessment_id: number
  selected_locale: { direction?: 'rtl' | 'ltr', code: string }
  available_translations: string[]
  translations: object
  current_step: number
  current_element: number
  subject: object
  user: object
}

interface State {
  results: Result,
  assessment?: Assessment,
  loaded: boolean,
  error: boolean,
}

export const defaultState: State = {
  results: {} as Result,
  loaded: false,
  error: false,
}

interface FetchResponse {
  response: {
    assessment: Assessment
    user_result: Result
  }
}

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchResponse) => {
    const { assessment, user_result } = response

    const results = { ...user_result, user: humps.camelizeKeys(user_result.user || {}) }
    return {
      ...state, assessment, results, loaded: true,
    }
  },
  [FETCH_FAILURE]: (state: State) => ({ ...state, loaded: true, error: true }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
