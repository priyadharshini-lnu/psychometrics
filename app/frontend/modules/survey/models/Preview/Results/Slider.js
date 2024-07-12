import _ from 'lodash'
import Utils from '~/modules/survey/utils'

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
    const notApplicableCount = _.countBy(this.result.notApplicable, c => c)?.true || 0
    const answers = this.result.answers.filter(a => this.result.notApplicable?.[a.index] !== true)
    return answers.length === (this.result.question.props.choices - notApplicableCount)
  },
})

export default Slider
