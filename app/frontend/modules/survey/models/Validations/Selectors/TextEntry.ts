import _ from 'lodash'

interface Answer {
  value: boolean | string | string[]
  index: number
}
interface Condition {
  answer: {}
  result: { answers: Answer[]}
  value: string
  type: string
}

function find (condition: Condition) {
  const answers = _.get(condition, ['result', 'answers'], [])
  const answer = _.find(answers, { index: +condition.answer })
  if (answer) {
    if (_.isArray(answer.value)) {
      if (answer.value.includes(condition.value)) {
        return answer
      }
    }
    if (answer.value === (condition.type === 'bool' ? true : condition.value)) {
      return answer
    }
  }
  return null
}

export default {
  Form (condition: Condition) {
    return find(condition)
  },
}
