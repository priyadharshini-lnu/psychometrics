import _ from 'lodash'

const Captcha = function (result) {
  this.result = result
}

_.extend(Captcha.prototype, {
  answer (answer) {
    this.result.answers = answer
  },

  results () {
    return this.result.answers
  },

  requiredValidation () {
    return true
  },
})

export default Captcha
