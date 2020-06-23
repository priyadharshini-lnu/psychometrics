import _ from 'lodash'
import Factors from 'rb/commands/Factors'
import AppStore from 'rb/store/AppStore'
import LookupSourceName from 'rb/commands/LookupSourceName'
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
