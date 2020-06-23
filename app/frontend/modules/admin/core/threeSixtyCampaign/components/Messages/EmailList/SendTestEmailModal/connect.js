import { connect } from 'react-redux'
import { closeModal } from 'modules/admin/core/temp/modals'
import { sendTestEmail } from 'modules/admin/core/threeSixtyCampaign/emailTemplates'

export default connect(
  ({ temp: { modals: { current } } }) => ({ current }),
  {
    closeModal,
    sendTestEmail,
  },
)
