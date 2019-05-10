import { connect } from 'react-redux'
import { getLodingState } from 'admin/core/temp/request'


export default connect(
  state => ({ loading: getLodingState(state) }),
  null,
)
