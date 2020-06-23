import { connect } from 'react-redux'
import { fetch } from 'modules/user/core/checkingWizard'

export default connect(({ checkingWizard }) => ({
  checks: checkingWizard.checks,
  config: checkingWizard.config,
  campaignId: checkingWizard.campaignId,
  id: checkingWizard.id,
  url: checkingWizard.url,
}), {
  fetch,
})
