import { connect } from 'react-redux'
import { fetch } from 'user/core/temp/checkingWizard'

export default connect(({ temp: { checkingWizard } }) => ({
  checks: checkingWizard.checks,
  campaignId: checkingWizard.campaignId,
  id: checkingWizard.id,
  url: checkingWizard.url,
}), {
  fetch,
})
