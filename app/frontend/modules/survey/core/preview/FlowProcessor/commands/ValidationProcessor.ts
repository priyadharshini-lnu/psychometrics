import _ from 'lodash'
import Result from 'modules/survey/models/Preview/Result'
import { setIn } from 'utils/immutable'
import { QuestionsInterface, ResultsInterface } from '../interfaces'

const ValidationProcessor = {
  run (questions: QuestionsInterface, results: ResultsInterface): {[questionId: number]: []} {
    return _.reduce(questions, (errors, question) => {
      const result = results[question.id] || {}

      const choicesIds = _.times(question.props.choices, i => i)
      const qwrap = { ...question, choicesIds, requiredValidation: question.required_validation }
      const resultModel = new Result(qwrap, result.answers, result.not_applicable)
      const err = resultModel.validate()

      if (!err.length) return errors

      return setIn(errors, question.id, err)
    }, {})
  },
}

export default ValidationProcessor
