import _ from 'lodash'
import Utils from 'utils'

const Slider = function (result) {
  this.result = result
  this.result.answers = _.filter(this.result.answers,
    answer => _.includes(this.result.question.choicesIds, parseInt(answer.index, 10)))
}

_.extend(Slider.prototype, {
  answer (index, value, precision) {
    const object = _.find(this.result.answers, { index })
    if (object) {
      object.value = Utils.round(value, precision)
    } else {
      this.result.answers.push({ index, value: Utils.round(value, precision) })
    }
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length === this.result.question.props.choices
  },
})

export default Slider
