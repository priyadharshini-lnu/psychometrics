import _ from 'lodash'

const HotSpot = function (result) {
  this.result = result
}

_.extend(HotSpot.prototype, {
  answer (regionId, value) {
    const object = _.find(this.result.answers, { region: regionId })
    if (object) {
      object.value = value
    } else {
      this.result.answers.push({ region: regionId, value })
    }
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return true
  },
})

export default HotSpot
