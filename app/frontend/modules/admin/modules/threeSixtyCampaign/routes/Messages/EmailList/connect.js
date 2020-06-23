import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'
import {
  fetch,
  update,
  save,
  get as getEmailTemplates,
} from 'modules/admin/modules/threeSixtyCampaign/core/emailTemplates'


export default connect(
  state => ({ emailTemplates: getEmailTemplates(state) }),
  {
    fetch,
    update,
    save,
    openModal,
  },
)
