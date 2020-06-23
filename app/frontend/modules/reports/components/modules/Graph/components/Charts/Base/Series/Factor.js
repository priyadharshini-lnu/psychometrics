import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'

export const Functions = {
  Count (results) {
    return results.length
  },
  Mean (results) {
    const sum = _.reduce(results, (n, result) => result.getValue() + n, 0)
    return sum / results.length
  },
}

export default {
  series (results, factors, model, func = 'Count') {
    const data = _.map(factors, factor => ({
      name: I18nStore.tFactorName(factor),
      y: Functions[func](_.result(results.scoring[factor.id], 'results', [])),
    }))
    return [{
      colorByPoint: true,
      data,
    }]
  },
  functions: _.keys(Functions),
}
