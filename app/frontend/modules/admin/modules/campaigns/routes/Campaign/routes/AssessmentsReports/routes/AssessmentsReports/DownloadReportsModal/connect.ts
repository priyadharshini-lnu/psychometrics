import { connect, ConnectedProps } from 'react-redux'
import {
  get as getReports,
} from '~/modules/admin/modules/campaigns/core/reports'
import { RootState } from '~/modules/admin/core/rootReducers'

const connector = connect(
  (state: RootState) => ({
    reports: getReports(state).list,
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector
