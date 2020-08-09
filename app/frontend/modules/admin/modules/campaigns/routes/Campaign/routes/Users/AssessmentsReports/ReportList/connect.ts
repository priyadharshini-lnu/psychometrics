import { connect, ConnectedProps } from 'react-redux'
import { get as getReports } from 'modules/admin/modules/campaigns/core/userReports'

const connecter = connect(
  state => ({
    reports: getReports(state),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
