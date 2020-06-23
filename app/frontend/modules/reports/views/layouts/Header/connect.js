import { connect } from 'react-redux'

export default connect(
  state => ({
    report: state.report,
  }),
  {
  },
)
