import _ from 'lodash'
import Factors from 'rb/commands/Factors'

export const Functions = {
}

export default {
  series (results, factor, model) {
    const sourceType = _.get(model, 'props.source.type')
    return Factors.LookupValue.call(results.externalScoring, sourceType, factor)
  },
  functions: _.keys(Functions),
}
