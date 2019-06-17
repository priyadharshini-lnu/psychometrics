import { connect } from 'react-redux'
import {
  add,
  update,
  remove,
  getReminderRules,
} from 'admin/core/threeSixtyCampaign/emailTemplates/reminderRules'

export default connect(
  state => ({ rules: getReminderRules(state) }),
  {
    add,
    update,
    remove,
  },
)
