import _ from 'lodash'
import I18nStore from 'rb/store/I18nStore'
import { Functions } from '../../Base/Series/Factor'

export default {
  series (results, factors, model, func = 'Count') {
    const data = _.map(factors, factor => Functions[func](_.result(results.scoring[factor.id], 'results', [])))
    return [{
      data,
    }]
  },

  xAxis (factors) {
    const labels = _.map(factors, factor => I18nStore.tFactorName(factor))
    return {
      categories: labels,
    }
  },

  functions: _.keys(Functions),
}
