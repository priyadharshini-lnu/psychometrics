import { connect } from 'react-redux'
import { subscribeSocket } from 'modules/reports/core/temp/socket'

export default connect(
  ({ report }) => ({
    reportLoaded: report.builder.loaded,
    disabled: report.disabled,
    socketInitialized: report.ui.socket.initialized,
  }),
  {
    subscribeSocket,
  },
)
