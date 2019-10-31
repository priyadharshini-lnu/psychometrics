import _ from 'lodash'

const PickGroupRank = function (result) {
  this.result = result
}

_.extend(PickGroupRank.prototype, {
  answer (scale, choice, value) {
    _.remove(this.result.answers, { choice })
    if (scale >= 0) {
      this.result.answers.push({ scale, choice, value })
    }
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length === this.result.question.props.choices
  },
})

export default PickGroupRank
