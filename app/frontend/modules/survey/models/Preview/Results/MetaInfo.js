import _ from 'lodash'

const MetaInfo = function (result) {
  this.result = result
}

_.extend(MetaInfo.prototype, {
  answer (object) {
    this.result.answers = object
  },

  // Force Response
  requiredValidation () {
    return true
  },
})

export default MetaInfo
