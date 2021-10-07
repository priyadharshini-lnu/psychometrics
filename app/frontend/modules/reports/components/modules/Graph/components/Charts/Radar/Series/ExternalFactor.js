import _ from 'lodash'
import Factors from 'modules/reports/commands/Factors'

export const Functions = {}

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    return [{
      data: (factors || []).map(factor => Factors.LookupValue.call(results.externalScoring, sourceType, factor)),
      name: 'All Responses',
    }]
  },
  functions: _.keys(Functions),
}
