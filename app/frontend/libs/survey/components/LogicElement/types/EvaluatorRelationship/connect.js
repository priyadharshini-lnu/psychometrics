import { connect } from 'react-redux'

export default connect(
  state => ({
    relationships: state.survey.builder.assessment.relationships,
  }),
  {},
)
