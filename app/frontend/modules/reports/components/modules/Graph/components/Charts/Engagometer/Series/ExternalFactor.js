import _ from 'lodash'
import Factors from 'rb/commands/Factors'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    const data = (factors || []).map(factor => Factors.LookupValue.call(results.externalScoring, sourceType, factor))
    const total = _.sum(data)
    let currentValue = 0
    return _.map(data, (obj) => {
      const res = {
        from: currentValue,
        to: currentValue + _.round(obj * 100 / total, 1),
      }
      currentValue = res.to
      return res
    })
  },
  functions: _.keys(Functions),
}
