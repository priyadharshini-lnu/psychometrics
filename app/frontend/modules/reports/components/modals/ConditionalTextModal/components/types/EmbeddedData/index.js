import { connect } from 'react-redux'
import { getEmbeddedData } from '~/modules/reports/core/builder/selectors'
import NumericComparator from '../NumericComparator'

export default connect((state, { model }) => ({
  data: getEmbeddedData(state.report, model.module.assessment_id),
}), {})(NumericComparator)
