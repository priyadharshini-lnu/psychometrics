import { connect } from 'react-redux'
import {
  saveUniversalLink, regenerateUniversalLink,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'

export default connect(
  () => ({
  }),
  {
    saveUniversalLink,
    regenerateUniversalLink,
  },
)
