import { connect } from 'react-redux'
import { importRawResults, IMPORT_RAW_RESULTS } from 'modules/admin/modules/campaigns/core/assessments'
import { isRequestInProgress } from 'modules/admin/core/request'

export default connect(
  state => ({
    loading: isRequestInProgress(state, IMPORT_RAW_RESULTS),
  }),
  {
    importRawResults,
  },
)
