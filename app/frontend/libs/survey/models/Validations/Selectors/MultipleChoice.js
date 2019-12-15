import _ from 'lodash'

function find (condition) {
  const answers = _.get(condition, ['result', 'answers'], [])
  return _.find(answers, { index: +condition.answer, value: true })
}

export default {
  SingleAnswer (condition) {
    return find(condition)
  },
  MultipleAnswer (condition) {
    return find(condition)
  },
  Dropdown (condition) {
    return find(condition)
  },
  SelectBox (condition) {
    return find(condition)
  },
  MultiSelectBox (condition) {
    return find(condition)
  },
}
