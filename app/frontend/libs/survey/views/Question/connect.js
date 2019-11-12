import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  () => ({}),
  {
    openDisplayLogic: data => open('displayLogic', data),
    openDefaultValue: data => open('defaultValue', data),
  },
)
