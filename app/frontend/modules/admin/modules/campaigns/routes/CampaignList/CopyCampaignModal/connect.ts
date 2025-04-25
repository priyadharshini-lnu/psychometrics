import { connect, ConnectedProps } from 'react-redux'
import {
  copy,
} from '~/modules/admin/modules/campaigns/core/list'
import { closeModal } from '~/modules/admin/core/ui/modals'

const connecter = connect(
  () => ({}), {
    copy,
    closeModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
