import {
  takeLatest, put,
} from 'redux-saga/effects'
import _ from 'lodash'
import { setIn } from '~/utils/immutable'
import { ACCEPT_POLICY } from '../project'

export const getCampaignRemainingTime = state => (
  _.get(state, ['campaigns', 'userAssessment', 'results', 'remaining_campaign_time'])
)

function substituteTextWithPipedData (text, pipedTextData) {
  if (!text || !pipedTextData) return text
  if (!/\{\{.*?}}/.test(text)) return text // checks for the piped text {{}} pattern in the text

  let substitutedText = text
  Object.entries(pipedTextData).forEach(([key, value]) => {
    substitutedText = substitutedText.replaceAll(key, value)
  })
  return substitutedText
}

function substitutePipedText (assessment, pipedTextData) {
  if (!assessment?.blocks || !pipedTextData) return assessment
  assessment.blocks?.forEach((block) => {
    if (block?.props?.staticContent?.value) {
      block.props.staticContent.value = substituteTextWithPipedData(block.props.staticContent.value, pipedTextData)
    }
    block.questions?.forEach((question) => {
      if (question?.props?.questionText) {
        question.props.questionText = substituteTextWithPipedData(question.props.questionText, pipedTextData)
      }
    })
  })
  return assessment
}

const SET_INVALIDATED = 'userAssessment/SET_INVALIDATED'

const FETCH = 'userAssessment/FETCH'
export const FETCH_RESULTS = 'userAssessment/FETCH_RESULTS'
const FETCH_FAILURE = 'userAssessment/FETCH_FAILURE'

export const FETCH_ASSESSMENT = 'userAssessment/FETCH_ASSESSMENT'
export const FETCH_PIPED_TEXT_DATA = 'userAssessment/FETCH_PIPED_TEXT_DATA'
export const FETCH_PIPED_TEXT_DATA_FAILURE = 'userAssessment/FETCH_PIPED_TEXT_DATA_FAILURE'
const VALIDATE_SESSION = 'userAssessment/VALIDATE_SESSION'
const MARK_MEETING_ASSESSMENT_COMPLETE = 'userAssessment/MARK_MEETING_ASSESSMENT_COMPLETE'
export const SET_MODIFIED_ASSESSMENT = 'userAssessment/SET_MODIFIED_ASSESSMENT'

export const setInvalidated = () => ({
  type: SET_INVALIDATED,
})

export const fetchPipedTextData = userAssessmentId => ({
  type: FETCH_PIPED_TEXT_DATA,
  request: {
    url: `/v2/user_assessments/${userAssessmentId}/piped_text_data`,
    camelize: false,
  },
})
export const fetchAssessment = (userAssessmentId, isEdit) => ({
  type: FETCH_ASSESSMENT,
  request: {
    url: `/user_assessments/${userAssessmentId}/assessment`,
    camelize: false,
    loader: true,
  },
  userAssessmentId,
  isEdit,
})

export const fetchUserAssessment = (userAssessmentId, isEdit) => ({
  type: FETCH,
  request: {
    url: `/user_assessments/${userAssessmentId}`,
    body: { edit: isEdit, cache: new Date().valueOf() },
  },
})


export const fetchResults = (userAssessmentId, isEdit) => ({
  type: FETCH_RESULTS,
  request: {
    url: `/user_assessments/${userAssessmentId}/users_results`,
    body: { edit: isEdit, cache: new Date().valueOf() },
    camelize: false,
    loader: true,
  },
})

export const markMeetingAssessmentComplete = userAssessmentId => ({
  type: MARK_MEETING_ASSESSMENT_COMPLETE,
  request: {
    url: `/user_assessments/${userAssessmentId}/mark_completed`,
    method: 'POST',
    loader: true,
  },
})


export const validateSession = (userAssessmentId, evaluationSessionId) => ({
  type: VALIDATE_SESSION,
  request: {
    url: '/evaluation_session_exists',
    body: { evaluationSessionId, userAssessmentId },
  },
})

export const defaultState = {
  results: {
    subject: {},
    participant: {},
  },
  assessment: {},
  userAssessment: {},
  userAssessmentData: {},
  loaded: false,
  error: false,
  invalidated: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, userAssessmentData: action.response }),
  [FETCH_FAILURE]: state => ({ ...state, loaded: true, error: true }),
  [FETCH_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.response }),
  [FETCH_RESULTS]: (state, action) => ({
    ...state,
    results: action.response,
    loaded: true,
    assessment: substitutePipedText(state.assessment, action.response.piped_text_mapping),
  }),
  [SET_INVALIDATED]: state => ({
    ...state, invalidated: true,
  }),
  [FETCH_PIPED_TEXT_DATA]: (state, action) => ({
    ...state, assessment: substitutePipedText(state.assessment, action.response),
  }),
  [ACCEPT_POLICY]: state => setIn(state, ['results', 'privacy_consent_required'], true),
  [SET_MODIFIED_ASSESSMENT]: (state, action) => ({ ...state, assessment: action.payload }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

function* genFetchResult ({ requestAction: { userAssessmentId, isEdit } }) {
  yield put(fetchResults(userAssessmentId, isEdit))
}

export const watchers = [takeLatest(FETCH_ASSESSMENT, genFetchResult)]
