import { connect } from 'react-redux'

export default connect(
  state => ({
    name: state.survey.builder.assessment.name,
  }),
  {
  },
)
