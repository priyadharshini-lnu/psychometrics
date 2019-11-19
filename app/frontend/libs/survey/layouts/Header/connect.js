import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  state => ({
    name: state.survey.builder.assessment.name,
  }),
  {
    openFlow: data => open('flow', data),
  },
)
