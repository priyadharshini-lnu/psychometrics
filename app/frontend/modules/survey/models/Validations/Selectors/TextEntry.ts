import _ from 'lodash'

interface Condition {
  answer: {}
  result: { answers: []}
  value: string
  type: string
}

function find (condition: Condition) {
  const answers = _.get(condition, ['result', 'answers'], [])
  return _.find(answers, { index: +condition.answer, value: condition.type === 'bool' ? true : condition.value })
}

export default {
  Form (condition: Condition) {
    return find(condition)
  },
}
