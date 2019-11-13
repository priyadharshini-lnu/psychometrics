import _ from 'lodash'

const MatrixTable = function (result) {
  this.result = result
  const { props } = this.result.question
  if (props.type === 'ConstantSum') {
    _.times(props.scalePoints, (scale) => {
      _.times(props.choices, (choice) => {
        if (!_.some(this.result.answers, { scale, choice })) {
          this.result.answers.push({ scale, choice, value: 0 })
        }
      })
    })
  }
}

_.extend(MatrixTable.prototype, {
  answer (...args) {
    this[this.result.question.props.type](...args)
  },

  // Force Response
  requiredValidation () {
    const notApplicable = _.keys(this.result.notApplicable).filter(key => this.result.notApplicable[key])
    const answers = _.map(this.result.answers, 'choice')

    return _.uniq(answers.concat(notApplicable)).length === this.result.question.props.choices
  },

  Likert (scale, choice, value) {
    if (this.result.question.props.answersType === 'MultipleAnswer') {
      this.multipleAnswer(scale, choice, value)
    } else {
      this.singleAnswer(scale, choice)
    }
  },

  Bipolar (scale, choice) {
    this.singleAnswer(scale, choice)
  },

  RankOrder (scale, choice, value) {
    this.multipleAnswer(scale, choice, value)
  },

  ConstantSum (scale, choice, value) {
    this.multipleAnswer(scale, choice, value)
  },

  TextEntry (scale, choice, value) {
    this.multipleAnswer(scale, choice, value)
  },

  Profile (scale, choice, value) {
    if (this.result.question.props.answersType === 'MultipleAnswer') {
      this.multipleAnswer(scale, choice, value)
    } else {
      this.singleAnswer(scale, choice)
    }
  },

  MaxDiff (scale, choice) {
    this.singleAnswer(scale, choice)
  },

  multipleAnswer (scale, choice, value) {
    _.remove(this.result.answers, { choice, scale })
    if (value) {
      this.result.answers.push({ scale, choice, value })
    }
  },

  singleAnswer (scale, choice) {
    _.remove(this.result.answers, { choice })
    this.result.answers.push({ scale, choice, value: true })
  },
})

export default MatrixTable
