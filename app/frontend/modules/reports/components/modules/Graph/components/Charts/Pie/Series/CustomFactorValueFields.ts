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
  series (results: FactorResults[], factors, model: PropertiesModel) {
    const useColorsFromGraphValueConditions = isGraphValueCondition(model.props.textConditionType)
    const colors = !useColorsFromGraphValueConditions ? model.props.colors.map(colorObj => colorObj.color) : []
    if (results) {
      const data = model.props.customFactorValueFields && model.props.customFactorValueFields.map((customField) => {
        const y = lodash.get(results, ['scoring', factors[0]?.id, customField], 0)
        const barColor = useColorsFromGraphValueConditions
          ? getColorForGraphValue(model.props.graphValueConditions, y) : undefined
        return ({
          name: I18n.t(`administration.report_builder.property_panel.custom_factor_fields.${customField}`),
          y,
          color: barColor,
        })
      })

      return [{
        name: I18nStore.tFactor(factors[0] || {}, 'name'),
        color: colors[0],
        data,
      }]
    }
    throw new Error('Bar chart supports multiple choices. See ResultManager to build correct array of results')
  },
  hasLegend: true,
}
