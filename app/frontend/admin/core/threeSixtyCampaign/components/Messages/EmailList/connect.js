import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import {
  fetch,
  update,
  save,
  get as getEmailTemplates,
} from 'admin/core/threeSixtyCampaign/emailTemplates'


export default connect(
  state => ({ emailTemplates: getEmailTemplates(state) }),
  {
    fetch,
    update,
    save,
    openModal,
  },
)
