import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
/**
  * Define mock results if it is required
  * Return results based filters
  */
export const getCorrectResults = (model) => {
  if (!ResultStore.realResults) {
    ResultStore.setMockResults(
      model.assessment_id, model.getSourceType(), model.getSourceModel(), model.props.source.factors,
    )
    if (model.isMultiFiltering() && model.props.filter
      && Array.isArray(model.props.filter) && model.props.filter.length) {
      return _.map(model.props.filter, f => ({
        filterId: f,
        results: ResultStore.results[model.assessment_id],
      }))
    }
  }
  if (ResultStore.realResults && model.props.filter) {
    if (model.isMultiFiltering() && Array.isArray(model.props.filter) && model.props.filter.length) {
      return _.map(model.props.filter, f => ({
        filterId: f,
        results: ResultStore.results[model.assessment_id].getByFilter(f),
      }))
    }
    return ResultStore.results[model.assessment_id].getByFilter(model.props.filter)
  }
  if (model.isMultiFiltering()) {
    return [{ desc: 'All Responses', results: ResultStore.results[model.assessment_id] }]
  }
  return ResultStore.results[model.assessment_id]
}

export default {
  getCorrectResults,
}
