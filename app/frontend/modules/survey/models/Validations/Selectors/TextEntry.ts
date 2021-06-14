import _ from 'lodash'

interface Condition {
  answer: {}
  result: { answers: []}
}

function find (condition: Condition) {
  const answers = _.get(condition, ['result', 'answers'], [])
  return _.find(answers, { index: +condition.answer, value: true })
}

export default {
  Form (condition: Condition) {
    return find(condition)
  },
}
