/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'
import Question from '~/modules/survey/models/Question'
import { Question as QuestionInerface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import {
  UPDATE_QUESTION, CHANGE_TYPE, ADD_NOTE, RENAME_QUESTION,
  changeType, renameQuestion,
} from '../assessment/question/actions'
import { QuestionSerializer } from '../assessment/SerializeAssessment'

export const INIT_QUESTION_CENTER = 'survey/question_center/INIT_QUESTION_CENTER'
const SAVE = 'survey/question_center/SAVE'
const IMPORT_TRANSLATIONS = 'survey/question_center/IMPORT_TRANSLATIONS'

export const save = (q: QuestionInerface) => {
  const question = QuestionSerializer(new Question(q))

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

export const importTranslations = (id, data: FormData) => ({
  type: IMPORT_TRANSLATIONS,
  request: {
    method: 'POST',
    url: `/administration/translations/questions/${id}/import`,
    body: data,
    camelize: false,
    decamelize: false,
    contentType: 'multipart/form-data;' as const,
  },
})

interface State {
  loaded: boolean,
  disabled: boolean,
  saving: boolean,
  question: QuestionInerface | null,
}

export const defaultState = {
  loaded: false,
  disabled: false,
  saving: false,
  question: null,
}

type ChangeTypeType = ReturnType<typeof changeType>
type RenameQuestionType = ReturnType<typeof renameQuestion>
interface AddNoteType {
  type: typeof ADD_NOTE,
  question: QuestionInerface
}
type UpdateQuestionType = AddNoteType
interface InitQuestionType {
  type: typeof INIT_QUESTION_CENTER,
  data: QuestionInerface
}

const HANDLERS = {
  [INIT_QUESTION_CENTER]: (state, { data }: InitQuestionType) => ({
    ...state,
    id: data.id,
    question: data,
    loaded: true,
  }),
  [ADD_NOTE]: (state: State, { question }: AddNoteType) => (
    setIn(state, [question.id, 'showComments'], true)
  ),
  [RENAME_QUESTION]: (state: State, { value }: RenameQuestionType) => (
    setIn(state, ['question', 'name'], value)
  ),
  [CHANGE_TYPE]: (state: State, { question, qtype, props }: ChangeTypeType) => {
    Question.prototype.changeType.call(question, qtype, props)
    return setIn(state, 'question', _.cloneDeep(question))
  },
  [UPDATE_QUESTION]: (state: State, { question }: UpdateQuestionType) => setIn(
    state, 'question', { ...QuestionSerializer(_.cloneDeep(question)) },
  ),
  [SAVE]: (state: State) => setIn(state, ['saving'], false),
}

export default createReducer(HANDLERS, defaultState)
