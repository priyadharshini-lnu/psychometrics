import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'

export const Functions = {}

export const getFilterName = (filterId) => {
  const filter = _.find(AppStore.report.filters, { id: filterId })
  if (filter) return filter.name

  return filterId
}

export default {
  series (results, factors, model) {
    return results.map((result, i) => {
      let data = _.map(factors, (factor) => {
        const factorResults = result.results.scoring[factor.id]
        if (factorResults && factorResults.results) {
          const sum = _.reduce(factorResults.results, (n, res) => res.getValue() + n, 0)
          return sum / factorResults.results.length
        }
        return 0
      })
      if (!ResultStore.realResults) {
        data = data.map(d => d - (i / 2)).map((d) => {
          if (d > model.props.radarMax) return model.props.radarMax
          return d
        })
      }
      return {
        data,
        name: result.desc || getFilterName(result.filterId),
      }
    })
  },
  functions: _.keys(Functions),
}
