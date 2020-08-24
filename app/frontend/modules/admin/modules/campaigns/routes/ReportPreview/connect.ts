import { connect, ConnectedProps } from 'react-redux'
import {
  fetchSingle as fetchReport, getCurrent, download, DOWNLOAD,
} from 'modules/admin/modules/campaigns/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  downloadInProgress: isRequestInProgress(state, DOWNLOAD),
}), {
  fetchReport,
  download,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
