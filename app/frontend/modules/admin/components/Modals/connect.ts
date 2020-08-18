import { connect, ConnectedProps } from 'react-redux'
import { getCurrent, getData, closeModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    current: getCurrent(state),
    data: getData(state),
  }),
  {
    closeModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
