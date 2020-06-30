import { connect } from 'react-redux'
import { preSignUrl } from 'modules/user/modules/threesixtyCampaign/core/checkingWizard'

export default connect(({ checkingWizard }) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
  preSignUrl,
})
