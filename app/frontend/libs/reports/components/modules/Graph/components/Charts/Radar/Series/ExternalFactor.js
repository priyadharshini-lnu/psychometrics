import _ from 'lodash'
import Factors from 'rb/commands/Factors'

export const Functions = {}

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    return (factors || []).map(factor => Factors.LookupValue.call(results.externalScoring, sourceType, factor))
  },
  functions: _.keys(Functions),
}
