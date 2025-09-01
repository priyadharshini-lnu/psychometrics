import result from 'lodash/result'
import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import Result from '~/modules/reports/models/Result'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

type FactorResults = {
  desc: string,
  filterId: string,
  results: Result
}

export const Functions = {
  Count (results) {
    return results.length
  },
  Mean (results) {
    const sum = results.reduce((n, result) => result.getValue() + n, 0)
    return sum / results.length
  },
}

export default {
  series (results: FactorResults[], factors, model: PropertiesModel, func: 'Count' | 'Mean' = 'Count', factorsData) {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? model.props.colors.map(colorObj => colorObj.color) : []
    if (results) {
      const resultsData = model.props.hideEmptyFilters ? results.filter(r => !_.isEmpty(r.results.scoring)) : results
      return resultsData.map((res, i) => {
        const data = factors && factors.map((factor) => {
          const y = (Functions[func] || Functions.Count)(result(res.results.scoring[factor.id], 'results', []))
          const barColor = useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, data) : undefined
          return ({
            name: I18nStore.tFactor(factor, 'name'),
            y,
            custom: {
              description: I18nStore.tFactor(_.find(factorsData, { id: factor.id }), 'description'),
            },
            color: barColor,
          })
        })
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
  functions: Object.keys(Functions),
}
