import { connect, ConnectedProps } from 'react-redux'
import { remove } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { get as getReports } from 'modules/admin/modules/campaigns/core/reports'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    reports: getReports(state).list,
  }), {
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
