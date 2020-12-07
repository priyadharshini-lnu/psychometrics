/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { DEPRECATED_createReducer } from 'utils/redux'
import _ from 'lodash'
import { setIn } from 'utils/immutable'
import Question from 'modules/survey/models/Question'
import { Question as QuestionInerface } from 'modules/survey/core/preview/FlowProcessor/interfaces'
import {
  UPDATE_QUESTION, CHANGE_TYPE, ADD_NOTE, RENAME_QUESTION,
} from '../assessment/question/actions'
import { QuestionSerializer } from '../assessment/SerializeAssessment'

export const INIT_QUESTION_CENTER = 'survey/question_center/INIT_QUESTION_CENTER'
const SAVE = 'survey/question_center/SAVE'

export const save = (q: QuestionInerface) => {
  const question = QuestionSerializer(q)

  return {
    type: SAVE,
    request: {
      method: 'PUT',
      url: `/administration/templates/questions/${question.id}`,
      body: { question },
      camelize: false,
      decamelize: false,
    },
  }
}

export const defaultState = {
  loaded: false,
  disabled: false,
  saving: false,
  question: null,
}

const HANDLERS = {
  [INIT_QUESTION_CENTER]: (state, { data }) => ({
    ...state,
    id: data.id,
    question: data,
    loaded: true,
  }),
  [ADD_NOTE]: (state, { question }) => setIn(state, [question.id, 'showComments'], true),
  [RENAME_QUESTION]: (state, { question, value }) => setIn(state, [question.id, 'name'], value),
  [CHANGE_TYPE]: (state, { question, qtype, props }) => {
    Question.prototype.changeType.call(question, qtype, props)
    return setIn(state, 'question', _.cloneDeep(question))
  },
  [UPDATE_QUESTION]: (state, { question }) => setIn(
    state, 'question', { ...QuestionSerializer(_.cloneDeep(question)) },
  ),
  [SAVE]: state => setIn(state, ['saving'], false),
}

export default DEPRECATED_createReducer(HANDLERS, defaultState)
