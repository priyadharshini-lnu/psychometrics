import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import {
  getResponseDataMismatchRequest,
  clearResponseDataMismatched,
} from 'modules/admin/core/request'

const connecter = connect(
  (state: RootState) => ({
    ...getResponseDataMismatchRequest(state),
  }),
  {
    clearResponseDataMismatched,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
