import { connect } from 'react-redux'

export default connect(
  ({ report: { builder } }) => ({
    reportStyles: builder.styles,
  }),
  {
  },
)
