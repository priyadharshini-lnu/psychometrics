import { connect } from 'react-redux'
import { subscribeSocket } from '~/modules/reports/core/temp/socket'
import { fetch, init } from '~/modules/reports/core/builder/actions'

export default connect(
  ({ report }) => ({
    reportLoaded: report.builder.loaded,
    disabled: report.disabled,
    socketInitialized: report.ui.socket.initialized,
  }),
  {
    fetch,
    init,
    subscribeSocket,
  },
)
