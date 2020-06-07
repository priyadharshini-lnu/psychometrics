import { connect } from 'react-redux'

export default connect(
  ({ report }) => ({
    loaded: report.builder.loaded,
  }),
  {},
)
