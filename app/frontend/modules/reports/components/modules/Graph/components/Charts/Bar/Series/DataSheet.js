import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    return results.map((res, i) => {
      const data = (model.props.source.columns || []).map((column) => {
        const y = parseFloat(res.results.dataSheet[column])
        const barColor = useColorsFromGraphValueConditions
          ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined
        return ({
          name: column,
          y,
          color: barColor,
        })
      })
      return {
        name: res.desc || AppStore.report.getFilterNameById(res.filterId),
        color: colors[i],
        data,
      }
    })
  },
  hasLegend: true,
  functions: _.keys(Functions),
}
