import { connect, ConnectedProps } from 'react-redux'
import { remove, update } from 'modules/admin/modules/campaigns/core/assessmentGroups'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  () => ({}),
  {
    remove,
    update,
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
