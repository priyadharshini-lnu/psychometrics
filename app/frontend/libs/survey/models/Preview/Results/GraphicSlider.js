import _ from 'lodash'

const GraphicSlider = function (result) {
  this.result = result
}

_.extend(GraphicSlider.prototype, {
  answer (value) {
    this.result.answers = [{ value }]
  },

  // Force Response
  requiredValidation () {
    return this.result.answers.length
  },
})

export default GraphicSlider
