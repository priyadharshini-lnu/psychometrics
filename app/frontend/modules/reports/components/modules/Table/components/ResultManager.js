import ResultStore from 'rb/store/ResultStore'

export default {
  /**
   * Define mock results if it is required
   * Return results based filters
   */
  getCorrectResults () {
    const { model } = this.props
    if (!ResultStore.realResults) {
      ResultStore.setMockResults(model.assessment_id, 'Factor', model.getSourceModel())
    }
    if (ResultStore.realResults && model.props.filter) {
      return ResultStore.results[model.assessment_id].getByFilter(model.props.filter)
    }
    return ResultStore.results[model.assessment_id]
  },
}
