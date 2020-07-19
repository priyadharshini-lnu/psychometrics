import _ from 'lodash'

const RankOrder = function (result) {
  this.result = result
  this.fillResult()
}

_.extend(RankOrder.prototype, {
  // TODO (atanych): within separated issue we should:
  // 1) handle SelectBox
  // 2) adapt answer method for all modules
  answer (index, value) {
    if (_.isArray(index)) {
      this.result.answers = index
    } else {
      const object = _.find(this.result.answers, { index })
      if (object) {
        object.value = value
      } else {
        this.result.answers.push({ index, value })
      }
    }
  },

  results () {
    return this.result.answers
  },

  fillResult () {
    if (this.result.answers.length === 0) {
      _.times(this.result.question.props.choices, (i) => {
        this.result.answers.push({ index: i, value: i })
      })
    }
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length === this.result.question.props.choices
  },
})

export default RankOrder
