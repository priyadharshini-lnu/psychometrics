import { getIn, setIn } from 'utils/immutable'
import { createReducer } from 'utils/reduxUtils'
import Question from 'models/Question'
import QuestionSerializer from 'models/QuestionSerializer'
import {
  ADD_QUESTION, ADD_QUESTIONS, CHANGE_TYPE, UPDATE_POSITIONS, UPDATE_QUESTION,
  ADD_SKIP_LOGIC, REMOVE_SKIP_LOGIC, SAVE_DISPLAY_LOGIC, RENAME_QUESTION, PERMANENT_REMOVE,
  SAVE_AS_TEMPLATE, UNLINK_TEMPLATE, CHANGE_VALIDATION, ADD_NOTE, ADD_COMMENT,
  REMOVE_COMMENT,
} from './actions'
import {
  REMOVE_QUESTION, ADD_PAGE_BREAK, RESTORE_QUESTION,
} from '../block/actions'
import { INIT, EMPTY_TRASH } from '../actions'
import { questionsWithoutDeleted } from '../selectors'

const HANDLERS = {
  [INIT]: (_, { data }) => (data.entities.questions || {}),
  [ADD_QUESTION]: (state, { question }) => setIn(state, [question.id], QuestionSerializer.toJSON(question)),
  [ADD_QUESTIONS]: (state, { questions }) => {
    const newState = _.clone(state)
    _.each(questions, (q) => { newState[q.id] = QuestionSerializer.toJSON(q) })
    return newState
  },
  [REMOVE_QUESTION]: (state, { question }) => setIn(state, [question.id, 'deleted'], true),
  [RESTORE_QUESTION]: (state, { question }) => setIn(
    state, [question.id], Object.assign({}, question, { deleted: false, deleted_at: null }),
  ),
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
  [SAVE_DISPLAY_LOGIC]: (state, { question, logicElement }) => setIn(
    state, [question.id, 'display_logic'], logicElement,
  ),
  [RENAME_QUESTION]: (state, { question, value }) => setIn(state, [question.id, 'name'], value),
  [PERMANENT_REMOVE]: (state, { question }) => setIn(state, [question.id, 'permanentRemove'], true),
  [EMPTY_TRASH]: (state) => {
    const questions = _.cloneDeep(state)
    _.each(questions, (q) => { if (q.deleted) q.permanentRemove = true })
    return questions
  },
  [SAVE_AS_TEMPLATE]: (state, { question }) => setIn(state, [question.id, 'save_as_template'], true),
  [UNLINK_TEMPLATE]: (state, { question }) => setIn(
    state, [question.id], Object.assign({}, question, { save_as_template: false, template_id: null }),
  ),
  [CHANGE_VALIDATION]: (state, { question, data }) => setIn(
    state, [question.id, 'validation'], { ...data },
  ),
  [ADD_NOTE]: (state, { question }) => setIn(state, [question.id, 'showComments'], true),
  [ADD_COMMENT]: (state, { question, comment }) => setIn(
    state, [question.id, 'comments'], getIn(state, [question.id, 'comments']).concat([comment]),
  ),
  [REMOVE_COMMENT]: (state, { question, comment }) => setIn(
    state, [question.id, 'comments'], getIn(state, [question.id, 'comments']).filter(({ id }) => id !== comment.id),
  ),
}

export default createReducer(HANDLERS, {})
