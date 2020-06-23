import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'

import {
  add,
  update,
  remove,
  merge,
} from 'modules/admin/modules/threeSixtyCampaign/core/emailSchedules/recipientCriteria'

export default connect(
  null,
  {
    add,
    update,
    remove,
    merge,
    openModal,
  },
)
