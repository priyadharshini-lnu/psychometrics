import { connect } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers.ts'

export default connect(
  (state: RootState) => ({
    currentUser: state.currentUser,
  }),
  {
  },
)
