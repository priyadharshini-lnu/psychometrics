import _ from 'lodash'
import AppStore from 'rb/store/AppStore'
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
    const colors = _.map(model.props.colors, 'color')

    if (Array.isArray(results)) {
      return _.map(results, (res, i) => {
        const data = _.map(factors, factor => ({
          name: I18nStore.tFactorName(factor),
          y: (Functions[func] || Functions.Count)(_.result(res.results.scoring[factor.id], 'results', [])),
        }))
        return {
          name: res.desc || AppStore.report.getFilterNameById(res.filterId),
          color: colors[i],
          data,
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
