/* eslint-disable prefer-spread */
import _ from 'lodash'

const SkillsRater = function (result) {
  this.result = result
}

_.extend(SkillsRater.prototype, {
  answer (level) {
    this.result.answers = [{
      level,
      value: true,
    }]
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers?.length > 0
  },
})

export default SkillsRater
