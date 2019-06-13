import { connect } from 'react-redux'
import {
  fetch,
  update,
  save,
  getEmailTemplates,
  changeSelected,
} from 'admin/core/threeSixtyCampaign/emailTemplates'

export default connect(
  state => ({ emailTemplates: getEmailTemplates(state) }),
  {
    fetch,
    update,
    save,
    changeSelected,
  },
)
