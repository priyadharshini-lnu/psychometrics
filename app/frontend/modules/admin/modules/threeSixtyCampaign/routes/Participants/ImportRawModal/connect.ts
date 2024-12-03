import { connect } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import {
  importRawResults, IMPORT_RAW_RESULTS,
} from '~/modules/admin/modules/threeSixtyCampaign/core'

export default connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT_RAW_RESULTS),
  }),
  {
    importRawResults,
  },
)
