import { connect, ConnectedProps } from 'react-redux'
import { get as getReports } from 'modules/admin/modules/campaigns/core/reports'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    reports: getReports(state),
  }),
  {
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
