import { connect, ConnectedProps } from 'react-redux'
import { get as getReports, remove, selectRecords } from 'modules/admin/modules/campaigns/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    reports: getReports(state),
  }),
  {
    selectRecords,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
