import { connect } from 'react-redux'
import { preSignUrl } from 'modules/user/modules/campaigns/core/checkingWizard'
import { RootState } from 'modules/user/core/rootReducers'

export default connect(({ checkingWizard }: RootState) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
  transcribeSupportedLocales: checkingWizard.transcribeSupportedLocales,
}), {
  preSignUrl,
})
