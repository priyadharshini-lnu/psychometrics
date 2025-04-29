import { connect, ConnectedProps } from 'react-redux'
import { clearRequestErrors, getRequestErrors } from '~/core/errors'
import { RootState } from '~/modules/admin/core/rootReducers'

const connector = connect(
  (state: RootState) => ({
    ...getRequestErrors(state),
  }),
  {
    clearRequestErrors,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector
