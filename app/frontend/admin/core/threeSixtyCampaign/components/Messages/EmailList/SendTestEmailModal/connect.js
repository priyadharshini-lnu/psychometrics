import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { sendTestEmail } from 'admin/core/threeSixtyCampaign/emailTemplates'

export default connect(
  ({ temp: { modals: { current } } }) => ({ current }),
  {
    closeModal,
    sendTestEmail,
  },
)
