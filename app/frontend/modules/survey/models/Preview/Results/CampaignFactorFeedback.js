import _ from 'lodash'

const CampaignFactorFeedback = function (result) {
  this.result = result
}

_.extend(CampaignFactorFeedback.prototype, {
  answer (value) {
    this.result.answers = [...value]
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return this.result.answers?.length > 0
  },
})

export default CampaignFactorFeedback
