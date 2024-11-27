import _ from 'lodash'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'

/**
  * Define mock results if it is required
  * Return results based filters
  */
export const getCorrectResults = (model, mockFactorIds = []) => {
  if (!ResultStore.realResults) {
    let factors = model.props.source.allFactors
      ? AppStore.factorsByAssessmentId(model.assessment_id)
      : model.props.source.factors
    if (mockFactorIds.length) {
      factors = AppStore.factorsByAssessmentId(model.assessment_id).filter(f => mockFactorIds.includes(f.id))
    }
    const assessment = AppStore.getAssessmentById(model.assessment_id)
    let scoreType = null
    if (assessment.category === 'saville') { scoreType = model.getScoreType() }

    ResultStore.setMockResults(
      model.assessment_id,
      model.getSourceType(),
      model.getSourceModel(),
      factors,
      scoreType,
      model.props.source.valueType,
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
      const availableFilters = [...new Set(ResultStore.results[model.assessment_id]
        .rawResults.map(result => result.relationship))]
      const filters = Object.fromEntries(AppStore.report.filters.map(filter => [filter.name, filter.id]))
      return availableFilters.map(f => ({
        filterId: filters[f],
        results: ResultStore.results[model.assessment_id].getByFilter(filters[f]),
      }))
    }
    if (!Array.isArray(model.props.filter)) {
      return ResultStore.results[model.assessment_id].getByFilter(model.props.filter)
    }
  }
  if (model.isMultiFiltering()) {
    return [{ desc: 'All Responses', results: ResultStore.results[model.assessment_id] }]
  }
  return ResultStore.results[model.assessment_id]
}

export default {
  getCorrectResults,
}
