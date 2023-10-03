import { connect } from 'react-redux'
import {
  deactivateUniversalLink, regenerateUniversalLink, toggleMultipleResponses,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'

export default connect(
  () => ({
  }),
  {
    deactivateUniversalLink,
    regenerateUniversalLink,
    toggleMultipleResponses,
  },
)
