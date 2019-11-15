import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  ({ survey: { builder: { assessment: { timestemp, propPanel } } } }) => ({ ...propPanel, timestemp }),
  {
    openDisplayLogic: data => open('displayLogic', data),
    openPreview: data => open('preview', data),
  },
)
