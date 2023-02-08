import { connect, ConnectedProps } from 'react-redux'
import {
  remove,
} from '~/modules/admin/modules/campaigns/core/list'
import { closeModal } from '~/modules/admin/core/ui/modals'

const connecter = connect(
  () => ({}), {
    remove,
    closeModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
