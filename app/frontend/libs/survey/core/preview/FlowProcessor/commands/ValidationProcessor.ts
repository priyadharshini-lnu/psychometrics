import _ from 'lodash'
import Result from 'libs/survey/models/Preview/Result'
import { setIn } from 'utils/immutable'

const ValidationProcessor = {
  run (questions, results) {
    return _.reduce(questions, (errors, question) => {
      const result = results[question.id] || {}

      const choicesIds = _.times(question.props.choices, i => i)
      const qwrap = { ...question, choicesIds, requiredValidation: question.required_validation }
      const resultModel = new Result(qwrap, result.answers, result.notApplicable)
      const err = resultModel.validate()

      if (!err.length) return errors

      return setIn(errors, question.id, err)
    }, {})
  },
}

export default ValidationProcessor
