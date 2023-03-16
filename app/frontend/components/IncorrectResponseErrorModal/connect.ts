import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  getResponseDataMismatchRequest,
  clearResponseDataMismatched,
} from '~/core/request'

const connector = connect(
  (state: RootState) => ({
    ...getResponseDataMismatchRequest(state),
  }),
  {
    clearResponseDataMismatched,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector
