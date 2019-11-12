import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  () => ({}),
  {
    openRandomization: data => open('randomization', data),
  },
)
