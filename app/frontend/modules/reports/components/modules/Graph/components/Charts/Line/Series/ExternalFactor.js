import _ from 'lodash'
import Factors from 'modules/reports/commands/Factors'
import AppStore from 'modules/reports/store/AppStore'
import LookupSourceName from 'modules/reports/commands/LookupSourceName'
import { Functions } from '../../Base/Series/Factor'

export default {
  series (results, factors, model) {
    const sourceType = _.get(model, 'props.source.type')
    const data = (factors || []).map(factor => Factors.LookupValue.call(results.externalScoring, sourceType, factor))
    return [{ data }]
  },

  xAxis (factors, model) {
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    const labels = _.map(factors, factor => LookupSourceName.call(assessment, factor, model.getSourceType()))
    return {
      categories: labels,
    }
  },

  functions: _.keys(Functions),
}
