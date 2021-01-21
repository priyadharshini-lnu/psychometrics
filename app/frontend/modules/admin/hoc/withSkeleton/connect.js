import { connect } from 'react-redux'
import { getLoadingState } from 'modules/admin/core/request'


export default connect(
  state => ({ loading: getLoadingState(state) }),
  null,
)
