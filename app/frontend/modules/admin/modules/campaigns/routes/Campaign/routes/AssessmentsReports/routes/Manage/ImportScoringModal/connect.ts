import { connect } from 'react-redux'
import { importScoringResults, IMPORT_SCORING_RESULTS } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { isRequestInProgress } from 'modules/admin/core/request'

export default connect(
  state => ({
    loading: isRequestInProgress(state, IMPORT_SCORING_RESULTS),
  }),
  {
    importScoringResults,
  },
)
