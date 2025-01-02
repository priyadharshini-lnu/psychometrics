import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'

export const Functions = {}

export const getFilterName = (filterId) => {
  const filter = AppStore.report.getFilterNameById(filterId)
  if (filter) return filter

  return filterId
}

export default {
  series (results, factors, model, factorsData) {
    const resultsData = model.props.hideEmptyFilters ? results.filter(r => !_.isEmpty(r.results.scoring)) : results
    return resultsData.map((result, i) => {
      let data = _.map(factors, (factor) => {
        const factorResults = result.results.scoring[factor.id]
        if (factorResults && factorResults.results) {
          const sum = _.reduce(factorResults.results, (n, res) => res.getValue() + n, 0)
          return {
            name: I18nStore.tFactor(factor, 'name'),
            y: sum / factorResults.results.length,
            custom: {
              description: I18nStore.tFactor(_.find(factorsData, { id: factor.id }), 'description'),
            },
          }
        }
        return {
          y: 0,
        }
      })
      if (!ResultStore.realResults) {
        data = data.map(d => ({ ...d, y: d.y - (i / 2) })).map((d) => {
          if (d.y > model.props.radarMax) return { ...d, y: model.props.radarMax }
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
