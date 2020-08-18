import { connect, ConnectedProps } from 'react-redux'
import { get as getReports, remove } from 'modules/admin/modules/campaigns/core/reports'

const connecter = connect(
  state => ({
    reports: getReports(state),
  }), {
    remove,

  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
