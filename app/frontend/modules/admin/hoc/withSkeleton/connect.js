import { connect } from 'react-redux'
import { getLodingState } from 'modules/admin/core/request'


export default connect(
  state => ({ loading: getLodingState(state) }),
  null,
)
