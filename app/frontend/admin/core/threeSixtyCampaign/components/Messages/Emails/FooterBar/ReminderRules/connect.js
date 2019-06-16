import { connect } from 'react-redux'
import {
  fetch,
  update,
  save,
  getReminderRules,
  changeSelected,
} from 'admin/core/threeSixtyCampaign/emailTemplates'

export default connect(
  state => ({ rules: getReminderRules(state) }),
  {
    fetch,
    update,
    save,
    changeSelected,
  },
)
