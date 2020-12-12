import _ from 'lodash'
import LogicResolver from 'modules/survey/models/logic/LogicResolver'
import LogicElementModel from 'models/logic/LogicElement'

const NormResolver = function (rules, hris, questions = null, results = null) {
  this.questions = questions
  this.results = results
  this.rules = rules
  this.hris = hris || {}
  this.type = null
  this.id = null
}

_.extend(NormResolver.prototype, {

  resolve () {
    const ruleWithNormId = this.rules.filter(rule => rule.norm_id).find((rule) => {
      const resolver = new LogicResolver(
        new LogicElementModel(rule), { questions: this.questions, results: this.results },
      )
      return resolver.resolve()
    }) || {}

    // TODO (atanych): remove right after https://tte.atlassian.net/browse/LH-1224
    const ruleWithNormType = this.rules.filter(rule => rule.norm_type).find((rule) => {
      const resolver = new LogicResolver(
        new LogicElementModel(rule), { questions: this.questions, results: this.results },
      )
      return resolver.resolve()
    }) || {}

    return {
      id: ruleWithNormId.norm_id,
      type: ruleWithNormType.norm_type,
    }
  },
})

export default NormResolver
