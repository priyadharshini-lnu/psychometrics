import Question from 'libs/survey/models/Preview/Question'
import Result from 'libs/survey/models/Preview/Result'
import _ from 'lodash'

export default function ValidationProcessor (questions, results) {
  const errors = {}
  _.each(questions, (question) => {
    const result = results[question.id] || {}
    const resultModel = new Result(question, result.answers, result.notApplicable)
    const err = resultModel.validate()

    if (err.length) {
      errors[question.id] = err
    }
  })
  return errors
}
