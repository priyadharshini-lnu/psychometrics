import _ from 'lodash'
import I18nStore from 'modules/reports/store/I18nStore'
import { Functions } from '../../Base/Series/Factor'

export default {
  series (results, factors, model, func = 'Count', factorsData) {
    const data = _.map(factors, factor => ({
      name: I18nStore.tFactor(factor, 'name'),
      y: Functions[func](_.result(results.scoring[factor.id], 'results', [])),
      custom: {
        description: I18nStore.tFactor(_.find(factorsData, { id: factor.id }), 'description'),
      },
    }))
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
