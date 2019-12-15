const clearAfterAssessmentChange = function (model) {
  delete model.props.factors
  model.props.textConditions = []
  model.textConditions = []
  if (model.props.source) {
    delete model.props.source.factors
    delete model.props.source.id
    delete model.props.source.name
    delete model.props.source.columns
    delete model.props.source.type
  }
  return model
}

export default clearAfterAssessmentChange
