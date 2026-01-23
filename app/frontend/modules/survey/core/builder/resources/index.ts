import _ from 'lodash'
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { setIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'
import { INIT } from '../assessment/actions'
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

interface AssessmentInterface {
  id: number
  name: string
}

interface State {
  defaultAssessmen: string | null
  assessments: AssessmentInterface[]
  assessmentQuestions: {[id: number]: {id: number, name: string, props: unknown}}
  resources: ResourceInterface[]
}

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
export const changeResource = (index: number, resource: ResourceInterface) => ({
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

type LoadAssessmentsType = ApiActionResponse<AssessmentInterface[]>
type LoadQuestionsType = ApiActionResponse<{[id: number]: {id: number, name: string, props: unknown}}>
type ChangeResourceType = ReturnType<typeof changeResource>
type ReorderResourceType = ReturnType<typeof reorderResources>
type SaveResourceType = ApiActionResponse<ResourceInterface>

type InitType = {type: string, data: {entities: {assessment, questions}}}

const HANDLERS = {
  [INIT]: (state: State, { data }: InitType): State => {
    const { assessment: assessments, questions } = data.entities
    const [id] = _.keys(assessments)
    const assessment = assessments[id]
    return {
      ...state,
      defaultAssessmen: id,
      resources: assessment.resources || [],
      assessmentQuestions: {
        ...assessment.resources_data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [id]: _.filter(allQuestions({ questions }), (q: any) => q.type === 'StaticContent'),
      },
    }
  },
  [LOAD_ASSESSMNTS]: (state: State, { response }: LoadAssessmentsType) => ({ ...state, assessments: response }),
  [LOAD_QUESTIONS]: (state: State, { response, requestAction: { assessmentId } }: LoadQuestionsType) => setIn(
    state, ['assessmentQuestions', assessmentId], response,
  ),
  [ADD_RESOURCE]: ({ ...state }: State) => ({
    ...state, resources: [...state.resources, { assessmentId: state.defaultAssessmen, questionId: null }],
  }),
  [CHANGE_RESOURCE]: (state: State, { index, resource }: ChangeResourceType) => setIn(
    state, ['resources', index], resource,
  ),
  [REORDER_RESOURCES]: (state: State, { resources }: ReorderResourceType) => setIn(
    state, ['resources'], resources,
  ),
  [REMOVE_RESOURCE]: (state: State, { index }: SaveResourceType) => setIn(
    state, 'resources', _.filter(state.resources, (_resource, i) => i !== index),
  ),
}

export const defaultState: State = {
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
