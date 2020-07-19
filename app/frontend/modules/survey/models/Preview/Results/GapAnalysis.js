import _ from 'lodash'

const GapAnalysis = function (result) {
  this.result = result
}

_.extend(GapAnalysis.prototype, {
  answer (choice, scale, values) {
    const object = _.find(this.result.answers, { choice })
    if (object) {
      object.scale = scale
      object.values = values
    } else {
      this.result.answers.push({ scale, choice, values })
    }
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length === this.result.question.props.choices
  },
})

export default GapAnalysis
