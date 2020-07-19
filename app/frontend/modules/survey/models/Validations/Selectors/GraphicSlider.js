import _ from 'lodash'

export default {
  Main (condition) {
    return _.find(condition.result.answers, { value: condition.value })
  },
}
