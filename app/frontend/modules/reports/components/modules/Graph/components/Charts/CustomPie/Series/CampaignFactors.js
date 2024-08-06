import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import { STRATEGIES } from '../consts'

const MAX_SCORING_VALUE = 6

export const Functions = {}

const buildForSources = (results, columns, model) => {
  const campaignFactorResults = _.keyBy(results.campaignFactorResults, 'code')
  const data = (columns || []).map(col => parseFloat(campaignFactorResults[col]?.value) || 0)
  return _.map(data, obj => _.round((obj * 100) / (model.props.radarMax || MAX_SCORING_VALUE), 1))
}

const buildForFilters = (results, columns, model) => results.map((result, i) => {
  const campaignFactorResults = _.keyBy(results.campaignFactorResults, 'code')
  let data = (columns || []).map(col => parseFloat(campaignFactorResults[col]?.value) || 0)
  if (!ResultStore.realResults) {
    data = data.map(d => d + i)
  }
  return {
    data: _.map(data, obj => _.round((obj * 100) / (model.props.radarMax || MAX_SCORING_VALUE), 1)),
    filterId: result.filterId,
  }
})

export default {
  series (results, columns, model, strategy) {
    if (strategy === STRATEGIES.SOURCES) {
      return buildForSources(results[0].results, columns, model)
    }
    if (strategy === STRATEGIES.FILTERS) {
      return buildForFilters(results, columns, model)
    }
    return []
  },
  functions: _.keys(Functions),
}
