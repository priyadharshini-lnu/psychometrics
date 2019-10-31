import _ from 'lodash'

export default function SelectedCount (condition) {
  _.remove(condition.result.answers, { value: false })
  return condition.result.answers.length
}
