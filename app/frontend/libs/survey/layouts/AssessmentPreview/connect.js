import { connect } from 'react-redux'

export default connect(
  ({ preview }) => ({
    end: preview.end,
    initialized: preview.initialized,
  }),
  {
  },
)
