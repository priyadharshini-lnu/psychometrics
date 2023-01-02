import { connect } from 'react-redux'
import { getSupportedDataConfiguration } from 'modules/reports/core/builder'
import NumericComparator from '../NumericComparator'

export default connect(state => ({
  data: getSupportedDataConfiguration(state).map(d => ({ value: d.id, label: d.label || d.id })),
}), {})(NumericComparator)
