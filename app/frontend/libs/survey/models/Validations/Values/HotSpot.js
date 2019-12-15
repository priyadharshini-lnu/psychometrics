import _ from 'lodash'

export default {
  Main (condition) {
    switch (condition.answer) {
      case 'LikeCount':
        return _.filter(condition.result.answers, { value: true }).length
      case 'OnCount':
        return _.filter(condition.result.answers, { value: true }).length
      case 'DislikeCount':
        return _.filter(condition.result.answers, { value: false }).length
      default:
        return condition.result.answers.length !== condition.question.props.regions.length
          ? (condition.question.props.regions.length - condition.result.answers.length)
          : _.filter(condition.result.answers, { value: null }).length
    }
  },
}
