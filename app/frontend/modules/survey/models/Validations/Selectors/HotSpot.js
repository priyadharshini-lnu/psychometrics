import _ from 'lodash'

export default {
  Main (condition) {
    switch (condition.answer) {
      case 'Like':
        return _.find(condition.result.answers, { value: true })
      case 'On':
        return _.find(condition.result.answers, { value: true })
      case 'Dislike':
        return _.find(condition.result.answers, { value: false })
      default:
        return _.find(condition.result.answers, { value: null }) || condition.result.answers.length === 0
    }
  },
}
