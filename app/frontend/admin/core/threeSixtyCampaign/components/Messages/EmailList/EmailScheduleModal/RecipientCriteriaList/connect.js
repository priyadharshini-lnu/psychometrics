import { connect } from 'react-redux'
import {
  add,
  update,
  remove,
  merge,
} from 'admin/core/threeSixtyCampaign/emailSchedules/recipientCriteria'

export default connect(
  null,
  {
    add,
    update,
    remove,
    merge,
  },
)
