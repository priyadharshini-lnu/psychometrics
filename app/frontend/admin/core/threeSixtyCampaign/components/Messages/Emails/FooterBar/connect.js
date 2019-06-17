import { connect } from 'react-redux'
import {
  getSelected as getSelectedEmailTemplate,
} from 'admin/core/threeSixtyCampaign/emailTemplates'

import {
  removeAll as removeAllReminderRules,
  add as addReminderRule,
} from 'admin/core/threeSixtyCampaign/emailTemplates/reminderRules'

export default connect(
  state => ({ emailTemplate: getSelectedEmailTemplate(state) }),
  {
    addReminderRule,
    removeAllReminderRules,
  },
)
