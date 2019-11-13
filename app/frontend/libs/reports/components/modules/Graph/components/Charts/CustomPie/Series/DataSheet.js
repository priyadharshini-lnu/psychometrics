import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import { STRATEGIES } from '../consts'

const MAX_SCORING_VALUE = 6

export const Functions = {}

const buildForSources = (results, columns) => {
  const data = (columns || []).map(col => _.meanBy(results.groupedDataSheet, d => parseFloat(d[col]) || 0))
  return _.map(data, obj => _.round((obj * 100) / MAX_SCORING_VALUE, 1))
}

const buildForFilters = (results, columns) => results.map((result, i) => {
  let data = (columns || []).map(col => _.meanBy(result.results.groupedDataSheet, d => parseFloat(d[col]) || 0))
  if (!ResultStore.realResults) {
    data = data.map(d => d + i)
  }
  return {
    data: data.map(obj => _.round((obj * 100) / MAX_SCORING_VALUE, 1)),
    filterId: result.filterId,
  }
})

export default {
  series (results, columns, model, strategy) {
    if (strategy === STRATEGIES.SOURCES) {
      return buildForSources(results[0].results, columns)
    }
    if (strategy === STRATEGIES.FILTERS) {
      return buildForFilters(results, columns)
    }
    return []
  },
  functions: _.keys(Functions),
}
