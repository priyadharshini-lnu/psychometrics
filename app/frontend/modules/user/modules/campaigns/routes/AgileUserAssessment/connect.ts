import { connect, ConnectedProps } from 'react-redux'
import { get as getConfig } from 'modules/user/core/config'
import { RootState } from 'modules/user/core/rootReducers'
import { get as getCurrentUser } from 'core/currentUser'

const connecter = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
  }),
  {},
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
