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
    return {
      answers: this.result.answers,
      not_applicable: this.result.notApplicable,
    }
  },

  // Force Response
  requiredValidation () {
    return this.result.answers?.length > 0 || this.result.notApplicable
  },
})

export default SkillsRater
