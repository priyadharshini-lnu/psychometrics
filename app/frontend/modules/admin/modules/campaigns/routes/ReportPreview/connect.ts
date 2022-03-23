import { connect, ConnectedProps } from 'react-redux'
import {
  fetchSingle as fetchReport, getCurrent, download, DOWNLOAD, asyncDownload, clearUseReportDetails,
} from 'modules/admin/modules/campaigns/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'
import { getFeatures } from 'core/config'

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  downloadInProgress: isRequestInProgress(state, DOWNLOAD),
  features: getFeatures(state),
}), {
  fetchReport,
  download,
  asyncDownload,
  clearUseReportDetails,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
