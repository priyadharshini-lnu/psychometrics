import Result from 'libs/survey/models/Preview/Result'
import _ from 'lodash'

export default function ValidationProcessor (questions, results) {
  const errors = {}
  _.each(questions, (question) => {
    const result = results[question.id] || {}

    const choicesIds = _.times(question.props.choices, i => i)
    const qwrap = {...question, choicesIds ,requiredValidation: question.required_validation}
    const resultModel = new Result(qwrap, result.answers, result.notApplicable)
    const err = resultModel.validate()

    if (err.length) {
      errors[question.id] = err
    }
  })
  return errors
}
