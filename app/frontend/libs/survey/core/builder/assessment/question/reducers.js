import { setIn } from 'utils/immutable'
import { createReducer } from 'utils/reduxUtils'
import Question from 'models/Question'
import QuestionSerializer from 'models/QuestionSerializer'
import {
  ADD_QUESTION, CHANGE_TYPE, UPDATE_POSITIONS, UPDATE_QUESTION,
  ADD_SKIP_LOGIC, REMOVE_SKIP_LOGIC, SAVE_DISPLAY_LOGIC, RENAME_QUESTION,
} from './actions'
import {
  REMOVE_QUESTION, ADD_PAGE_BREAK, COPY_QUESTION,
} from '../block/actions'
import { INIT } from '../actions'
import { questionsWithoutDeleted } from '../selectors'

const HANDLERS = {
  [INIT]: (_, { data }) => (data.entities.questions),
  [ADD_QUESTION]: (state, { question }) => setIn(state, [question.id], QuestionSerializer.toJSON(question)),
  [REMOVE_QUESTION]: (state, { question }) => setIn(state, [question.id, 'deleted'], true),
  [UPDATE_POSITIONS]: (state, { block }) => {
    if (!block) { return state }
    const questions = _.clone(state)
    const blockQuestions = questionsWithoutDeleted({ questions }, block.questions)
    let pos = 1
    _.each(blockQuestions, (q) => {
      q.position = pos
      questions[q.id] = q
      pos += 1
    })
    return questions
  },
  [CHANGE_TYPE]: (state, { question, qtype, props }) => {
    Question.prototype.changeType.call(question, qtype, props)
    return setIn(state, [question.id], _.cloneDeep(question))
  },
  [UPDATE_QUESTION]: (state, { question }) => setIn(
    state, [question.id], QuestionSerializer.toJSON(_.cloneDeep(question)),
  ),
  [ADD_PAGE_BREAK]: (state, { pb }) => setIn(state, [pb.id], pb),
  [ADD_SKIP_LOGIC]: (state, { question }) => {
    const newQuestion = _.cloneDeep(question)
    if (!newQuestion.skip_logic) {
      newQuestion.skip_logic = []
    }
    newQuestion.skip_logic.push({ prefix: 'And', subject: question.id, editMode: true })
    return setIn(state, [question.id], newQuestion)
  },
  [REMOVE_SKIP_LOGIC]: (state, { question, condition }) => {
    const newQuestion = _.cloneDeep(state[question.id])
    _.remove(newQuestion.skip_logic, c => _.isEqual(c, condition))
    return setIn(state, [question.id], newQuestion)
  },
  [SAVE_DISPLAY_LOGIC]: (state, { question, logicElement }) => setIn(state, [question.id, 'display_logic'], logicElement),
  [RENAME_QUESTION]: (state, { question, value }) => setIn(state, [question.id, 'name'], value),
}

export default createReducer(HANDLERS, [])
