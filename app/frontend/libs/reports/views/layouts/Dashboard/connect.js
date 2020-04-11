import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/reports/core/temp/socket'

export default connect(
  ({ report }) => ({
    loaded: report.loaded,
    disabled: report.disabled,
    socketInitialized: report.temp.socket.initialized,
  }),
  {
    subscribeSocket,
  },
)
