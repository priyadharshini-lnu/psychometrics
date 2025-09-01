import _ from 'lodash'
import AppStore from '~/modules/reports/store/AppStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const { graphValueConditions, textConditionType } = model.props
    const useColorsFromGraphValueConditions = isGraphValueCondition(textConditionType)
    const colors = !useColorsFromGraphValueConditions ? _.map(model.props.colors, 'color') : []
    return results.map((res, i) => {
      const data = (model.props.source.codes || []).map((code) => {
        const y = parseFloat(_.find(res.results.campaignFactorResults, { code })?.value, 10)
        const barColor = useColorsFromGraphValueConditions
          ? getColorForGraphValue(graphValueConditions, y) : undefined
        return ({
          name: LookupSourceName.call({}, code, 'CampaignFactors'),
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
