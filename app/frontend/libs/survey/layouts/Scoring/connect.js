import { connect } from 'react-redux'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
  }),
  {},
)
