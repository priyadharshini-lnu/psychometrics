import _ from 'lodash'
import AppStore from 'modules/reports/store/AppStore'
import Factors from 'modules/reports/commands/Factors'
import I18nStore from 'modules/reports/store/I18nStore'

export const Functions = {
}

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    const colors = _.map(model.props.colors, 'color')
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const factorsByIdAndType = _.keyBy(assessment.factors, f => `${f.id}/${f.type}`)
    return results.map((res, i) => {
      const data = (model.props.source.factors || []).map(f => ({
        name: I18nStore.tExternalFactorName(model.assessment_id, _.get(factorsByIdAndType, `${f}/${sourceType}`, f)),
        y: Factors.LookupValue.call(res.results.externalScoring, sourceType, f),
      }))
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
