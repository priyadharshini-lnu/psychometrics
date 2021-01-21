import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/ui/modals'
import {
  fetch,
  update,
  save,
  fetchByLocales,
  get as getEmailTemplates,
} from 'modules/admin/modules/threeSixtyCampaign/core/emailTemplates'


export default connect(
  state => ({ emailTemplates: getEmailTemplates(state), availableLocales: state.config.availableLocales }),
  {
    fetch,
    update,
    save,
    fetchByLocales,
    openModal,
  },
)
