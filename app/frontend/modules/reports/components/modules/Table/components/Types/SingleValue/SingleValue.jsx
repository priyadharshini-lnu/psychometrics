import _ from 'lodash'
import { connect } from 'react-redux'
import AppStore from '~/modules/reports/store/AppStore'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import Types from './Types'

const SingleValue = ({ model, questions }) => {
  const Type = Types[model.props.sourceType]
  const filters = model.props.filter.map(
    filterId => _.find(AppStore.report.filters, { id: filterId }),
  ).filter(f => !_.isEmpty(f))
  return (
    <div>
      <Type model={model} filters={filters} questions={questions} />
    </div>
  )
}

export default connect((state, { model }) => ({
  questions: getQuestions(state.report, model.assessment_id),
}), {})(SingleValue)
