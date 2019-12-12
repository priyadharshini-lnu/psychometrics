import { createReducer } from 'utils/reduxUtils'
import {
  select, takeEvery, put,
} from 'redux-saga/effects'
import { setIn } from 'utils/immutable'
import Scoring from 'models/Scoring'
import QuestionSerializer from 'models/QuestionSerializer'
import * as assessmentActions from '../assessment/actions'
import { allQuestions } from '../assessment/selectors'
import { selectedFactor } from './selectors'

export const SELECT_FACTOR = 'builder/factors/SELECT_FACTOR'
export const UPDATE_FACTOR = 'builder/factors/UPDATE_FACTOR'
export const SET_CURRENT_SCORING_AND_RECODING = 'builder/factors/SET_CURRENT_SCORING_AND_RECODING'
export const UPDATE_SCORING = 'builder/factors/UPDATE_SCORING'
export const UPDATE_RECODING = 'builder/factors/UPDATE_RECODING'
export const SAVE_SCORING = 'builder/factors/SAVE_SCORING'

export const selectFactor = id => ({
  type: SELECT_FACTOR, id,
})

export const setCurrentScoringAndRecoding = (scoring, recoding) => ({
  type: SET_CURRENT_SCORING_AND_RECODING, scoring, recoding,
})

// Save Scoring
// scoring: [
//   {
//     - Scoring Attributes
//   }
// ]
export const saveScoring = (assessmentId, factors, recoding) => {
  const scoring = []
  _.each(factors, (factorModel) => {
    _.each(factorModel.scoring, (scoringModel) => {
      scoring.push(scoringModel.toJSON())
    })
  })

  return ({
    type: SAVE_SCORING,
    request: {
      decamelize: false,
      method: 'put',
      url: `/administration/assessments/${assessmentId}/scoring`,
      body: { scoring, question_recoding: recoding },
    },
  })
}

const HANDLERS = {
  [assessmentActions.INIT]: (state, { data }) => {
    const { factors, assessment } = data.entities
    const recoding = assessment[data.result].question_recoding.map(q => new Scoring(q))
    return { ...state, factors, recoding }
  },
  [SELECT_FACTOR]: (state, { id }) => setIn(state, ['current'], id),
  [SET_CURRENT_SCORING_AND_RECODING]: (state, { scoring, recoding }) => setIn(
    { ...state, recoding }, ['factors', state.current, 'scoring'], scoring,
  ),
  [UPDATE_SCORING]: (state, { model }) => setIn(state, ['factors', state.current, 'scoring', model.question_id], model),
  [UPDATE_RECODING]: (state, { model }) => {
    const index = _.findIndex(state.recoding, model)
    if (index >= 0) { return setIn(state, ['recoding', index], model) }
    return state
  },
}

export const defaultState = {
  current: null,
  factors: {},
  recoding: [],
}

export default createReducer(HANDLERS, defaultState)

function* genEnsureSelectedFactor () {
  const { survey: { builder: { factors } } } = yield select()
  yield put(selectFactor(factors.factors[_.first(_.keys(factors.factors))].id))
}

function* genLoadScoring () {
  const { survey: { builder } } = yield select()
  const factor = selectedFactor(builder, builder.factors.current)
  const questions = allQuestions(builder)
  const recoding = _.clone(builder.factors.recoding)

  const scoring = {}
  _.each(factor.scoring, (item) => {
    scoring[item.question_id] = new Scoring(item, factor.id)
  })

  _.each(questions, (q) => {
    const question = QuestionSerializer.wrap(q)
    const module = question.moduleConfig
    if (!scoring[q.id] && module.scoring && !_.includes(module.scoringFilteredModules, question.props.type)) {
      scoring[q.id] = new Scoring({ question_id: q.id }, factor.id)
    }

    if (!_.find(recoding, r => r.question_id === question.id)) {
      recoding.push(new Scoring({ question_id: q.id, type: 'recoding' }))
    }
  })

  yield put(setCurrentScoringAndRecoding(scoring, recoding))
}

export const watchers = [
  takeEvery(assessmentActions.INIT, genEnsureSelectedFactor),
  takeEvery(SELECT_FACTOR, genLoadScoring),
]
