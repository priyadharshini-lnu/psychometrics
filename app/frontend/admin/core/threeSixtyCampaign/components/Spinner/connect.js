import { connect } from 'react-redux'
import { showSpinner, hideSpinner, getSpinnerState } from '../../../temp/spinner'

export default connect(
  state => ({ visible: getSpinnerState(state) }),
  { showSpinner, hideSpinner },
)
