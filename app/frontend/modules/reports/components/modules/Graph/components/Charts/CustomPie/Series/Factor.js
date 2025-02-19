import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import { STRATEGIES } from '../consts'

export const Functions = {
}

const MAX_SCORING_VALUE = 6

const buildForSources = (results, factors) => {
  const data = _.map(factors, (factor) => {
    const factorResults = results.scoring?.[factor.id]
    if (factorResults && factorResults.results) {
      const sum = _.reduce(factorResults.results, (n, result) => result.getValue() + n, 0)
      return sum / factorResults.results.length
    }
    return 0
  })
  return _.map(data, obj => _.round((obj * 100) / MAX_SCORING_VALUE, 1))
}

const buildForFilters = (results, factors) => results.map((result, i) => {
  let data = _.map(factors, (factor) => {
    const factorResults = result.results.scoring?.[factor.id]
    if (factorResults && factorResults.results) {
      const sum = _.reduce(factorResults.results, (n, res) => res.getValue() + n, 0)
      return sum / factorResults.results.length
    }
    return 0
  })
  if (!ResultStore.realResults) {
    data = data.map(d => d + i)
  }
  return {
    data: data.map(obj => _.round((obj * 100) / MAX_SCORING_VALUE, 1)),
    filterId: result.filterId,
  }
})

export default {
  series (results, factors, model, strategy) {
    const resultsData = model.props.hideEmptyFilters ? results.filter(r => !_.isEmpty(r.results.scoring)) : results
    if (strategy === STRATEGIES.SOURCES) {
      return buildForSources(resultsData[0].results, factors)
    }
    if (strategy === STRATEGIES.FILTERS) {
      return buildForFilters(resultsData, factors)
    }
    return []
  },
  functions: _.keys(Functions),
}
