import { connect } from 'react-redux'
import { currentModalsSelector } from 'core/modals/selectors'

export default connect(
  ({ survey: { modals } }) => ({
    current: currentModalsSelector(modals),
  }),
  {},
)
