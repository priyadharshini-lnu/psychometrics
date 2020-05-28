import { createReducer } from 'utils/reduxUtils'
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import { setIn } from 'utils/immutable'
import * as assessmentActions from '../assessment/actions'
import { allQuestions } from '../assessment/selectors'

export const LOAD_ASSESSMNTS = 'builder/resources/LOAD_ASSESSMNTS'
export const LOAD_QUESTIONS = 'builder/resources/LOAD_QUESTIONS'

export const ADD_RESOURCE = 'builder/resources/ADD_RESOURCE'
export const REMOVE_RESOURCE = 'builder/resources/REMOVE_RESOURCE'
export const CHANGE_RESOURCE = 'builder/resources/CHANGE_RESOURCE'
export const REORDER_RESOURCES = 'builder/resources/REORDER_RESOURCES'

export const SAVE_RESOURCES = 'builder/resources/SAVE_RESOURCES'

export const loadAssessments = assessmentId => ({
  type: LOAD_ASSESSMNTS,
  request: {
    decamelize: false,
    url: `/administration/assessments/${assessmentId}/assessments`,
  },
})

export const loadQuestions = assessmentId => ({
  type: LOAD_QUESTIONS,
  assessmentId,
  request: {
    body: {},
    decamelize: false,
    url: `/administration/assessments/${assessmentId}/questions`,
  },
})

export const reorderResources = resources => ({ type: REORDER_RESOURCES, resources })

export const addResource = () => ({ type: ADD_RESOURCE })
export const changeResource = (index, resource) => ({ type: CHANGE_RESOURCE, index, resource })
export const removeResource = index => ({ type: REMOVE_RESOURCE, index })


export const saveResources = (assessmentId, resources) => ({
  type: SAVE_RESOURCES,
  request: {
    decamelize: false,
    method: 'put',
    url: `/administration/assessments/${assessmentId}`,
    body: { resource: { resources: resources.map(r => (_.omit(r, 'id'))) } },
  },
})

const HANDLERS = {
  [assessmentActions.INIT]: (state, { data }) => {
    const { assessment: assessments, questions } = data.entities
    const [id] = _.keys(assessments)
    const assessment = assessments[id]
    return {
      ...state,
      defaultAssessmen: id,
      resources: assessment.resources || [],
      assessmentQuestions: {
        ...assessment.resources_data,
        [id]: _.filter(allQuestions({ questions }), q => q.type === 'StaticContent'),
      },
    }
  },
  [LOAD_ASSESSMNTS]: (state, { response }) => ({ ...state, assessments: response }),
  [LOAD_QUESTIONS]: (state, { response, requestAction: { assessmentId } }) => setIn(
    state, ['assessmentQuestions', assessmentId], response,
  ),
  [ADD_RESOURCE]: state => ({
    ...state, resources: [...state.resources, { assessmentId: state.defaultAssessmen, questionId: null }],
  }),
  [CHANGE_RESOURCE]: (state, { index, resource }) => setIn(state, ['resources', index], resource),
  [REORDER_RESOURCES]: (state, { resources }) => setIn(state, ['resources'], resources),
  [REMOVE_RESOURCE]: (state, { index }) => setIn(
    state, 'resources', _.filter(state.resources, (_resource, i) => i !== index),
  ),
}

export const defaultState = {
  defaultAssessmen: null,
  assessments: [],
  assessmentQuestions: {},
  resources: [],
}

export default createReducer(HANDLERS, defaultState)

function* genLoadQuestions ({ resource: { assessmentId } }) {
  const { survey: { builder: { resources } } } = yield select()

  if (!resources.assessmentQuestions[assessmentId]) {
    yield put(loadQuestions(assessmentId))
  }
}

export const watchers = [
  takeEvery(CHANGE_RESOURCE, genLoadQuestions),
]
