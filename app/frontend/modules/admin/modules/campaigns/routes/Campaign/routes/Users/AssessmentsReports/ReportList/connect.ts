import { connect, ConnectedProps } from 'react-redux'
import { get as getReports } from 'modules/admin/modules/campaigns/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    reports: getReports(state),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
