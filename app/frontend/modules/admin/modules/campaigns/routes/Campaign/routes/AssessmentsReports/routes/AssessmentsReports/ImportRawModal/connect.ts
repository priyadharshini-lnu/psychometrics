import { connect } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'

import { importRawResults, IMPORT_RAW_RESULTS } from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { isRequestInProgress } from '~/core/request'

export default connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT_RAW_RESULTS),
  }),
  {
    importRawResults,
  },
)
