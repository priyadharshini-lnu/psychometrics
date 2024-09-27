/* eslint-disable prefer-spread */
import _ from 'lodash'

const FactorSelect = function (result) {
  this.result = result
}

_.extend(FactorSelect.prototype, {
  answer (...args) {
    this[this.result.question.props.type].apply(this, args)
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers?.length > 0
  },

  Dropdown (factors) {
    if (!this.result.answers) {
      this.result.answers = []
    } else {
      this.result.answers = factors
    }
  },
})

export default FactorSelect
