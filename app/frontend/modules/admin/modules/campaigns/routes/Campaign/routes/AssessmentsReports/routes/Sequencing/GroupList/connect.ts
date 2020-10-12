import { connect, ConnectedProps } from 'react-redux'
import { getSortedGroups } from 'modules/admin/modules/campaigns/core/assessmentGroups'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    groups: getSortedGroups(state),
  }),
  {
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
