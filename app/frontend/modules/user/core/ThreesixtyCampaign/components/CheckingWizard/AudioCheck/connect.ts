import { connect } from 'react-redux'
import { preSignUrl } from 'modules/user/core/checkingWizard'

export default connect(({ checkingWizard }) => ({
  preSignedUrl: checkingWizard.preSignedUrl,
}), {
  preSignUrl,
})
