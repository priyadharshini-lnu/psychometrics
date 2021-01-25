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

    return {
      id: ruleWithNormId.norm_id,
    }
  },
})

export default NormResolver
