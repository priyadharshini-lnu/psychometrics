import result from 'lodash/result'
import AppStore from 'modules/reports/store/AppStore'
import I18nStore from 'modules/reports/store/I18nStore'
import { PropertiesModel } from 'modules/reports/interfaces/graphs/Bar'
import Result from 'modules/reports/models/Result'

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
  series (results: FactorResults[], factors, model: PropertiesModel, func: 'Count' | 'Mean' = 'Count') {
    const colors = model.props.colors.map(colorObj => colorObj.color)

    if (results) {
      return results.map((res, i) => {
        const data = factors && factors.map(factor => ({
          name: I18nStore.tFactorName(factor),
          y: (Functions[func] || Functions.Count)(result(res.results.scoring[factor.id], 'results', [])),
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
  functions: Object.keys(Functions),
}
