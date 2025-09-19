import lodash from 'lodash'
import I18nStore from '~/modules/reports/store/I18nStore'
import { PropertiesModel } from '~/modules/reports/interfaces/graphs/Bar'
import Result from '~/modules/reports/models/Result'
import { getColorForGraphValue, isGraphValueCondition } from '~/modules/reports/utils/GraphValueCondition'

const { I18n } = window

type FactorResults = {
  desc: string,
  filterId: string,
  results: Result
}

export default {
  series (results: FactorResults[], factors, model: PropertiesModel, _, factorsData) {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? model.props.colors.map(colorObj => colorObj.color) : []
    if (results) {
      const resultsData = model.props.hideEmptyFilters ? results.filter(
        r => !lodash.isEmpty(r.results.scoring),
      ) : results
      return (model.props.customFactorValueFields || []).map((customField, i) => {
        const data = factors && factors.map((factor) => {
          const y = lodash.get(resultsData[0], ['results', 'scoring', factor.id, customField], 0)
          const barColor = useColorsFromGraphValueConditions
            ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined
          return ({
            name: I18nStore.tFactor(factor, 'name'),
            y,
            custom: {
              description: I18nStore.tFactor(lodash.find(factorsData, { id: factor.id }), 'description'),
            },
            color: barColor,
          })
        })
        return {
          name: I18n.t(`administration.report_builder.property_panel.custom_factor_fields.${customField}`),
          color: colors[i],
          data,
        }
      })
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
}
