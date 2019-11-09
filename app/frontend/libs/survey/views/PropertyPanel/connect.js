import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  () => ({}),
  {
    openDisplayLogic: question => open('displayLogic', question),
  },
)
