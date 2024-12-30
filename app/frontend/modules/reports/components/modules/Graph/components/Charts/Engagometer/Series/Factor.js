import _ from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'

export const Functions = {
}

export default {
  series (results, factors, _model, _format, factorsData) {
    const data = _.map(factors, (factor) => {
      const factorResults = results.scoring?.[factor.id]
      if (factorResults && factorResults.results) {
        const sum = _.reduce(factorResults.results, (n, result) => result.getValue() + n, 0)
        return {
          y: sum / factorResults.results.length,
          custom: {
            description: I18nStore.tFactor(_.find(factorsData, { id: factor.id }), 'description'),
          },
        }
      }
      return { y: 0 }
    })
    const total = _.sumBy(data, 'y')
    let currentValue = 0
    return _.map(data, (obj) => {
      const res = {
        ...obj,
        from: currentValue,
        to: currentValue + _.round(obj.y * 100 / total, 1),
      }
      currentValue = res.to
      return res
    })
  },
  functions: _.keys(Functions),
}
