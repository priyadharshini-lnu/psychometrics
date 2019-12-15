import _ from 'lodash'

const Timing = function (result) {
  this.result = result
}

_.extend(Timing.prototype, {
  answer (firstClick, lastClick, pageSubmit, clickCount) {
    this.result.answers = {
      firstClick,
      lastClick,
      pageSubmit,
      clickCount,
    }
  },

  // Force Response
  requiredValidation () {
    return true
  },
})

export default Timing
