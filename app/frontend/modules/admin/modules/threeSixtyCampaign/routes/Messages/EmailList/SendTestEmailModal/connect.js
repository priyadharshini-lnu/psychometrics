import { connect } from 'react-redux'
import { closeModal, getCurrent } from 'modules/admin/core/ui/modals'
import { sendTestEmail } from 'modules/admin/modules/threeSixtyCampaign/core/emailTemplates'

export default connect(
  state => ({ current: getCurrent(state) }),
  {
    closeModal,
    sendTestEmail,
  },
)
