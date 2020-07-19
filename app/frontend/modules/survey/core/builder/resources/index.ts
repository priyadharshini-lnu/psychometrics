/* eslint-disable @typescript-eslint/no-explicit-any */
import { createReducer } from 'utils/redux'
import _ from 'lodash'
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

interface ResourceInterface {
  questionId: number | string | null
  assessmentId: number | string | null
}

interface State {
  defaultAssessmen: string | null
  assessments: [{id: number, name: string}]
  assessmentQuestions: {[id: number]: {id: number, name: string, props: any}}
  resources: ResourceInterface[]
}

interface ChangeResourceAction { type: typeof CHANGE_RESOURCE, index: number, resource: ResourceInterface }

export const loadAssessments = (assessmentId: string) => ({
  type: LOAD_ASSESSMNTS,
  request: {
    decamelize: false,
    url: `/administration/assessments/${assessmentId}/assessments`,
  },
})

export const loadQuestions = (assessmentId: number | string | null) => ({
  type: LOAD_QUESTIONS,
  assessmentId,
  request: {
    body: {},
    decamelize: false,
    url: `/administration/assessments/${assessmentId}/questions`,
  },
})

export const reorderResources = (resources: ResourceInterface[]) => ({
  type: REORDER_RESOURCES, resources,
})

export const addResource = () => ({ type: ADD_RESOURCE })
export const changeResource = (index: number, resource: ResourceInterface): ChangeResourceAction => ({
  type: CHANGE_RESOURCE, index, resource,
})
export const removeResource = (index: number) => ({ type: REMOVE_RESOURCE, index })

export const saveResources = (assessmentId: number, resources: ResourceInterface[]) => ({
  type: SAVE_RESOURCES,
  request: {
    decamelize: false,
    method: 'put',
    url: `/administration/assessments/${assessmentId}`,
    body: { resource: { resources: resources.map(r => (_.omit(r, 'id'))) } },
  },
})

const HANDLERS = {
  [assessmentActions.INIT]: (state: State, { data }): State => {
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
  [LOAD_ASSESSMNTS]: (state: State, { response }): State => ({ ...state, assessments: response }),
  [LOAD_QUESTIONS]: (state: State, { response, requestAction: { assessmentId } }): State => setIn(
    state, ['assessmentQuestions', assessmentId], response,
  ),
  [ADD_RESOURCE]: (state: State): State => ({
    ...state, resources: [...state.resources, { assessmentId: state.defaultAssessmen, questionId: null }],
  }),
  [CHANGE_RESOURCE]: (state: State, { index, resource }): State => setIn(state, ['resources', index], resource),
  [REORDER_RESOURCES]: (state: State, { resources }): State => setIn(state, ['resources'], resources),
  [REMOVE_RESOURCE]: (state: State, { index }): State => setIn(
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

function* genLoadQuestions ({ resource: { assessmentId } }: ReturnType<typeof changeResource>) {
  const { survey: { builder: { resources } } } = yield select()

  if (assessmentId && !resources.assessmentQuestions[assessmentId]) {
    yield put(loadQuestions(assessmentId))
  }
}

export const watchers = [
  takeEvery(CHANGE_RESOURCE, genLoadQuestions),
]
