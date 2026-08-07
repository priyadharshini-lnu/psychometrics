import { connect, ConnectedProps } from 'react-redux'
import {
  fetchSingle as fetchReport, getCurrent, download, DOWNLOAD, asyncDownload, clearUseReportDetails,
  startQC, sendToReview, abortQC, approveReport, requestChanges, removeApproval, markReady,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import { getFeatures, getProjectFeatures } from '~/core/config'

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  downloadInProgress: isRequestInProgress(state, DOWNLOAD),
  features: getFeatures(state),
  projectFeatures: getProjectFeatures(state),
  availableLanguages: state.config.availableLocales,
}), {
  fetchReport,
  download,
  asyncDownload,
  clearUseReportDetails,
  startQC,
  sendToReview,
  abortQC,
  approveReport,
  requestChanges,
  removeApproval,
  markReady,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
