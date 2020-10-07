import { connect, ConnectedProps } from 'react-redux'
import { getCurrent, extendTime } from 'modules/admin/modules/campaigns/core/users'

const connecter = connect(
  state => ({
    assessment: getCurrent(state),
  }),
  {
    extendTime,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
