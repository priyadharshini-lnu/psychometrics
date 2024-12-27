import _ from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'

export const Functions = {}

export default {
  series (results, factor, model, factorsData) {
    results = results.scoring?.[factor.id]
    if (results && results.results) {
      const sum = _.reduce(results.results, (n, result) => result.getValue() + n, 0)
      return {
        name: I18nStore.tFactor(factor, 'name'),
        y: _.round(sum / results.results.length, model.props.numberOfDecimals),
        custom: {
          description: I18nStore.tFactor(_.find(factorsData, { id: factor.id }), 'description'),
        },
      }
    }
    return { y: 0 }
  },
  functions: _.keys(Functions),
}
