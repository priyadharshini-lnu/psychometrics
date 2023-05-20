import _ from 'lodash'
import Result from '~/modules/survey/models/Preview/Result'
import { setIn } from '~/utils/immutable'
import { isMediaResponseQuestion } from '~/modules/survey/utils/question'
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
        const resultModel = new Result(qwrap, result.answers, result.not_applicable, results, answeredQuestions)
        err = resultModel.validate()
      }

      if (!err.length) return errors

      return setIn(errors, question.id, err)
    }, {})
  },
}

export default ValidationProcessor
