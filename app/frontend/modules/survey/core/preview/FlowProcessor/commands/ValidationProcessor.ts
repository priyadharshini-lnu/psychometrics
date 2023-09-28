import _ from 'lodash'
import Result from '~/modules/survey/models/Preview/Result'
import Utils from '~/modules/survey/utils/Utils'
import { setIn } from '~/utils/immutable'
import { isMediaResponseQuestion, isRichTextTextEntryQuestion } from '~/modules/survey/utils/question'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import {
  Question, QuestionsInterface, ResultsInterface, QuestionError,
} from '../interfaces'
import MediaResponseValidator from './MediaResponseValidator'

const ValidationProcessor = {
  run (
    questions: QuestionsInterface,
    results: ResultsInterface,
    mediaResponses: MediaResponse[],
    answeredQuestions: Question[],
  ): {[questionId: number]: []} {
    return _.reduce(questions, (errors, question) => {
      const result = results[question.id] || {}

      const choicesIds = _.times(question.props.choices, i => i)
      const qwrap = { ...question, choicesIds, requiredValidation: question.required_validation }
      let err: QuestionError[]
      if (isMediaResponseQuestion(question)) {
        err = MediaResponseValidator.run(question, mediaResponses)
      } else {
        // eslint-disable-next-line arrow-body-style, @typescript-eslint/no-explicit-any
        const stripHTML = (answers: any[]) => answers.map((answer) => {
          return {
            ...answer,
            value: Utils.stripHTML(answer.value),
          }
        })
        const answers = isRichTextTextEntryQuestion(question) && result.answers
          ? stripHTML(result.answers) : result.answers
        const resultModel = new Result(qwrap, answers, result.not_applicable, results, answeredQuestions)
        err = resultModel.validate()
      }

      if (!err.length) return errors

      return setIn(errors, question.id, err)
    }, {})
  },
}

export default ValidationProcessor
