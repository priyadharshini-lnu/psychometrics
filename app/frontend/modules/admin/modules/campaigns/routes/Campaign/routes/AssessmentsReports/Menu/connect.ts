import { connect, ConnectedProps } from 'react-redux'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  () => ({ }),
  {
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
