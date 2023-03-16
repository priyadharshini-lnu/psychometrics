import { connect } from 'react-redux'
import {
  deactivateUniversalLink, regenerateUniversalLink,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'

export default connect(
  () => ({
  }),
  {
    deactivateUniversalLink,
    regenerateUniversalLink,
  },
)
