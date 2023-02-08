import { connect } from 'react-redux'
import { getQuestions } from '~/modules/reports/core/builder/selectors'


export default connect(state => ({
  getQuestions: assessmentId => getQuestions(state.report, assessmentId),
}), {})
