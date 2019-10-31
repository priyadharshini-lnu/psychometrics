import _ from 'lodash'
import Factors from 'rb/commands/Factors'

export const Functions = {
}
const MAX_SCORING_VALUE = 6
export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    const data = factors.map(factor => Factors.LookupValue.call(results.externalScoring, sourceType, factor))
    return _.map(data, obj => _.round(obj * 100 / MAX_SCORING_VALUE, 1))
  },
  functions: _.keys(Functions),
}
