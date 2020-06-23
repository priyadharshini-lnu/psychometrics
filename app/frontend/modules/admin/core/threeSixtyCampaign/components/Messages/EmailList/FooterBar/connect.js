import { connect } from 'react-redux'

import {
  removeAll as removeAllReminderRules,
  add as addReminderRule,
} from 'modules/admin/core/threeSixtyCampaign/emailTemplates/reminderRules'

export default connect(
  null,
  {
    addReminderRule,
    removeAllReminderRules,
  },
)
